"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { Chat } from "@prisma/client";

import {
  FileIcon,
  LoaderIcon,
  CrossIcon,
  SmileIcon,
  UploadCloudIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { CreateFormSchema } from "@/schemas/form/create";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { uploadFileFirebase } from "@/services/upload-file";
import { initChatAPI, summarize } from "@/apis";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { processDocumentAPI } from "@/apis/process-document";
import { flashcardsAPI } from "@/apis/flashcards";

const CreateForm = () => {
  const { data } = useSession();
  const router = useRouter();
  const [chatId, setChatId] = useState<string>("");
  // save the chat in local variable

  const [stateOfAlert, setStateOfAlert] = useState({
    variant: "default",
    title: "HEY THERE!",
    description: "Upload your PDF file to get started",
  });

  // MUTATIONS

  // some FILE operations NEEDED when creation of chat ~ onSuccess of processDocumentAPI
  const { mutateAsync: generateSummary } = useMutation({
    mutationFn: summarize,
    onSuccess: (data) => {},
    onError: (error) => {},
  });
  const { mutateAsync: generateFlashcards } = useMutation({
    mutationFn: flashcardsAPI,
    onSuccess: (data) => {},
    onError: (error) => {},
  });

  // 1. upload file to the bucket
  const {
    mutateAsync: mutateUploadFile,
    isPending: uploadFileIsPending,
    isError: uploadFileIsError,
  } = useMutation({
    mutationFn: uploadFileFirebase,

    onError: (error) => {
      toast.error("Failed to upload file");
    },
    onSuccess: (data) => {
      toast.success("File uploaded successfully");
    },
  });
  // 2. getting the file reference and adding to the database
  const {
    mutateAsync: mutateInitChat,
    isPending: initChatIsPending,
    isError: initChatIsError,
  } = useMutation({
    mutationFn: initChatAPI,

    onError: (error) => {
      toast.error(`Failed to initialize chat`);
    },
    onSuccess: async (data) => {
      toast.success("Chat created successfully");
      // save the chat in the ref
      setChatId(data.chat.id);
    },
  });
  // 3. get document, load and split it, make embeddings and then store in the vector db
  const {
    mutateAsync: mutateProcessDocument,
    isPending: processDocumentIsPending,
    isError: processDocumentIsError,
  } = useMutation({
    mutationFn: processDocumentAPI,
    onError: (error) => {
      toast.error("Failed to process document");
    },
    onSuccess: async (data) => {
      // data is the collection
      toast.success("Document processed successfully");
      router.push(`/documents/${chatId}/view`);
      console.log(
        "🚀 ~  ~ onSuccess of process-document mutation ~ chatId:",
        chatId
      );
      await generateSummary({ chatId });
      await generateFlashcards({ chatId });
    },
  });
  //
  const form = useForm<z.infer<typeof CreateFormSchema>>({
    resolver: zodResolver(CreateFormSchema),
    mode: "onBlur",
    defaultValues: {
      title: "",
    },
  });
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
    onDrop: (acceptedFiles: FileWithPath[]) => {
      // Update the type of acceptedFiles to be an array
      form.setValue("pdfFile", acceptedFiles);
    },
  });

  // METHODS

  async function onSubmit(values: z.infer<typeof CreateFormSchema>) {
    const pdfLink = await mutateUploadFile(values.pdfFile[0]);

    const chatConfig = {
      name: values.title,
      pdfStoragePath: `uploads/${values.pdfFile[0].name}`,
      pdfLink: pdfLink,
      userId: data?.user?.id as string,
    };
    const initializedChat = await mutateInitChat(chatConfig);

    if (!initializedChat || !initializedChat.chat) return;

    const doc = await mutateProcessDocument({
      pdfStoragePath: initializedChat.chat.pdfStoragePath,
      collectionName: initializedChat.chat.collectionName,
    });

    // if (!initializedChat.chat.id) return;
  }

  useEffect(() => {
    if (uploadFileIsError || initChatIsError || processDocumentIsError) {
      setStateOfAlert({
        variant: "destructive",
        title: "Oops!",
        description: processDocumentIsError
          ? "Failed to process document"
          : uploadFileIsError
          ? "Failed to upload file"
          : "Failed to initialize chat",
      });
    } else if (
      uploadFileIsPending ||
      initChatIsPending ||
      processDocumentIsPending
    ) {
      setStateOfAlert({
        variant: "pending",
        title: uploadFileIsPending
          ? "Uploading file"
          : initChatIsPending
          ? "Initializing Chat"
          : "Processing Document",
        description: uploadFileIsPending
          ? "Please wait while we upload your file"
          : initChatIsPending
          ? "Please wait while we initialize your chat"
          : "Please wait while we process your document",
      });
    } else {
      setStateOfAlert({
        variant: "default",
        title: "HEY THERE!",
        description: "Upload your PDF file to get started",
      });
    }
  }, [
    uploadFileIsPending,
    uploadFileIsError,
    initChatIsPending,
    initChatIsError,
    processDocumentIsPending,
    processDocumentIsError,
  ]);

  return (
    <div className="max-w-2xl w-full flex flex-col py-4">
      {/* USER FEEDBACK */}
      <Alert
        variant={
          stateOfAlert.variant === "destructive" ? "destructive" : "default"
        }
      >
        {
          {
            destructive: <CrossIcon className="w-5 h-5" />,
            pending: <LoaderIcon className="w-5 h-5 animate-spin" />,
            default: <SmileIcon className="w-5 h-5" />,
          }[stateOfAlert.variant]
        }
        <AlertTitle>{stateOfAlert.title}</AlertTitle>
        <AlertDescription>{stateOfAlert.description}</AlertDescription>
        {/* pleaase be patient dont quite until its completed rephraaase it in better words */}
        <p className="text-muted-foreground text-xs mt-2">
          Note: Please do not close the tab until the process is completed
        </p>
      </Alert>

      {/* FORM */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 mt-12"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Python Crash Course" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pdfFile"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div
                    className={cn(
                      "border flex flex-col justify-center items-center py-10 space-y-2",
                      form.getValues("pdfFile")
                        ? "border-solid"
                        : "border-dashed"
                    )}
                    {...getRootProps()}
                  >
                    {form.getValues("pdfFile") ? (
                      <FileIcon className="w-10 h-10" />
                    ) : (
                      <UploadCloudIcon className="w-10 h-10" />
                    )}
                    {form.getValues("pdfFile") ? (
                      <p className="text-xs">
                        {form.getValues("pdfFile")[0].path}
                      </p>
                    ) : (
                      <p className="text-xs">
                        Drag and drop your PDF file here or{" "}
                        <span className="text-blue-500">browse</span>
                      </p>
                    )}
                    <Input {...getInputProps()} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={
              uploadFileIsPending ||
              initChatIsPending ||
              processDocumentIsPending || // if there is erorrs of the form validation state use hook form
              // if there is no file in form
              !form.getValues("pdfFile") ||
              !form.getValues("title")
            }
          >
            {uploadFileIsPending ||
            initChatIsPending ||
            processDocumentIsPending
              ? "Please wait..."
              : "Create Chat"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CreateForm;
