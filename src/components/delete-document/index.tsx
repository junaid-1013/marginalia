"use client";

import { LoaderIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface IProps {
  chatId: string;
  name: string;
}

const DeleteDocumentButton = ({ chatId, name }: IProps) => {
  const router = useRouter();
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/documents/${chatId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete the document");
    },
    onSuccess: () => {
      toast.success("Document deleted");
      router.refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
      disabled={isPending}
      onClick={() => {
        if (window.confirm(`Delete "${name}"? This removes the PDF, chat, summary, flashcards and quiz.`)) {
          mutate();
        }
      }}
    >
      {isPending ? (
        <LoaderIcon className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2Icon className="h-4 w-4" />
      )}
      <span className="sr-only">Delete {name}</span>
    </Button>
  );
};

export default DeleteDocumentButton;
