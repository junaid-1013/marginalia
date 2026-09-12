"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { AlertTriangleIcon, FileTextIcon, UploadCloudIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { initChatAPI } from "@/apis";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { uploadFile } from "@/services/upload-file";

const MAX_MB = 20;
const MAX_BYTES = MAX_MB * 1024 * 1024;

type Phase = "idle" | "uploading" | "creating";

interface IProps {
  /** the account already holds the maximum number of documents */
  atLimit?: boolean;
  limit?: number;
}

const readableSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

// "Cell-biology_week_4.pdf" -> "Cell biology week 4"
const titleFromFileName = (name: string) =>
  name.replace(/\.pdf$/i, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();

const rejectionMessage = (rejection: FileRejection) => {
  const code = rejection.errors[0]?.code;
  if (code === "file-too-large") {
    return `That file is ${readableSize(rejection.file.size)}. The limit is ${MAX_MB} MB.`;
  }
  if (code === "file-invalid-type") return "Only PDF files are supported.";
  if (code === "too-many-files") return "Add one file at a time.";
  return "That file could not be added. Try another PDF.";
};

const CreateForm = ({ atLimit = false, limit }: IProps) => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);

  const busy = phase !== "idle";

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxSize: MAX_BYTES,
    multiple: false,
    disabled: busy || atLimit,
    noClick: !!file, // with a file chosen the area is a summary, "Replace" opens the picker
    onDropAccepted: ([accepted]) => {
      setFile(accepted);
      setFileError(null);
      setFormError(null);
      // suggest a title from the file name until the person writes their own
      if (!titleTouched) setTitle(titleFromFileName(accepted.name));
    },
    onDropRejected: ([rejection]) => setFileError(rejectionMessage(rejection)),
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setTitleError(null);

    const name = title.trim();
    if (!file) return setFileError("Choose a PDF to upload.");
    if (name.length < 2) return setTitleError("Give the document a title of at least 2 characters.");

    // read the session fresh: the upload path and the server check both depend on the user id
    const userId = (await getSession())?.user?.id;
    if (!userId) return setFormError("Your session has expired. Log in again to continue.");

    try {
      setPhase("uploading");
      setProgress(0);
      const uploaded = await uploadFile({ file, userId, onProgress: setProgress });

      setPhase("creating");
      const { chat } = await initChatAPI({
        name,
        pdfStoragePath: uploaded.pathname,
        pdfLink: uploaded.url,
      });

      toast.success("Document added. Marginalia is reading it now.");
      router.push(`/documents/${chat.id}/view`);
    } catch (error) {
      setPhase("idle");
      const message = error instanceof Error ? error.message : "";
      if (/already have a document/i.test(message)) {
        setTitleError("You already have a document with this title. Choose another one.");
      } else {
        setFormError(message || "The upload did not finish. Check your connection and try again.");
      }
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate data-tour="uploader">
      {atLimit && (
        <Alert>
          <AlertDescription>
            You have reached the limit of {limit} documents. Delete one to add another.
          </AlertDescription>
        </Alert>
      )}

      <div
        {...getRootProps()}
        className={cn(
          "rounded-lg border bg-card transition-colors duration-150",
          !file && "border-dashed bg-card/50 hover:bg-accent/40",
          isDragActive && "border-highlight bg-accent",
          (busy || atLimit) && "pointer-events-none opacity-70",
          fileError && "border-destructive"
        )}
      >
        <input {...getInputProps()} aria-label="PDF file" />
        {file ? (
          <div className="flex items-center gap-3 p-4">
            <FileTextIcon className="h-8 w-8 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-caption">{readableSize(file.size)}</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={open} disabled={busy}>
              Replace
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Remove the file"
              disabled={busy}
              onClick={() => setFile(null)}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex cursor-pointer flex-col items-center gap-2 px-6 py-10 text-center">
            <UploadCloudIcon className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              {isDragActive ? "Drop the PDF here" : "Drag a PDF here, or click to choose one"}
            </p>
            <p className="text-caption">Text-based PDF, up to {MAX_MB} MB</p>
          </div>
        )}
      </div>
      {fileError && (
        <p className="-mt-3 text-sm text-destructive" role="alert">
          {fileError}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          placeholder="Cell biology, week 4"
          disabled={busy || atLimit}
          status={titleError ? "error" : undefined}
          onChange={(e) => {
            setTitle(e.target.value);
            setTitleTouched(true);
            setTitleError(null);
          }}
        />
        {titleError ? (
          <p className="text-sm text-destructive" role="alert">
            {titleError}
          </p>
        ) : (
          <p className="text-caption">Shown in your document list. Each title can be used once.</p>
        )}
      </div>

      {formError && (
        <Alert variant="destructive" className="py-3">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      {busy && (
        <div className="space-y-2" aria-live="polite">
          <Progress value={phase === "uploading" ? progress : 100} aria-label="Upload progress" />
          <p className="text-caption">
            {phase === "uploading" ? `Uploading ${progress}%` : "Adding it to your documents"}
          </p>
        </div>
      )}

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={busy || atLimit}>
        {busy ? (phase === "uploading" ? "Uploading" : "Adding document") : "Add document"}
      </Button>
      <p className="text-caption">
        Marginalia reads the PDF after the upload, which usually takes a minute or two. You can leave
        the page while it works.
      </p>
    </form>
  );
};

export default CreateForm;
