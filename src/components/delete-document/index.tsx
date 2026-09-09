"use client";

import { useState } from "react";
import { LoaderIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface IProps {
  chatId: string;
  name: string;
  className?: string;
}

const DeleteDocumentButton = ({ chatId, name, className }: IProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const remove = async () => {
    setPending(true);
    try {
      const response = await fetch(`/api/documents/${chatId}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      toast.success("Document deleted.");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("The document could not be deleted. Try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => !pending && setOpen(o)}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={className ?? "h-8 w-8 text-muted-foreground hover:text-destructive"}
        >
          <Trash2Icon className="h-4 w-4" />
          <span className="sr-only">Delete {name}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this document?</AlertDialogTitle>
          <AlertDialogDescription>
            &ldquo;{name}&rdquo; and its chat, summary, flashcards, quiz and notes will be removed.
            This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Keep it</AlertDialogCancel>
          {/* a plain button, not AlertDialogAction: the dialog must stay open while the request runs */}
          <Button variant="destructive" onClick={remove} disabled={pending}>
            {pending && <LoaderIcon className="h-4 w-4 animate-spin" />}
            {pending ? "Deleting" : "Delete document"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDocumentButton;
