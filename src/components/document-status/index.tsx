"use client";

import { LoaderIcon, AlertTriangleIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { processDocumentAPI } from "@/apis/process-document";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useDocumentStatus } from "@/hooks/use-document-status";

interface IProps {
  chatId: string;
}

/** Shown above the document tabs while it is being processed, or if that failed. */
const DocumentStatus = ({ chatId }: IProps) => {
  const queryClient = useQueryClient();
  const { data, isProcessing, isFailed } = useDocumentStatus(chatId);
  const { mutate: retry, isPending } = useMutation({
    mutationFn: processDocumentAPI,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["status", chatId] }),
  });

  if (!isProcessing && !isFailed) return null;

  return (
    <div className="container pt-4">
      <Alert variant={isFailed ? "destructive" : "default"}>
        {isFailed ? (
          <AlertTriangleIcon className="w-5 h-5" />
        ) : (
          <LoaderIcon className="w-5 h-5 animate-spin" />
        )}
        <AlertTitle>
          {isFailed ? "Processing failed" : "Processing your document"}
        </AlertTitle>
        <AlertDescription className="flex items-center justify-between gap-4">
          <span>
            {isFailed
              ? data?.processingError ?? "Something went wrong."
              : "This runs in the background. You can leave this page, chat unlocks when it is ready."}
          </span>
          {isFailed && (
            <Button size="sm" onClick={() => retry({ chatId })} disabled={isPending}>
              Retry
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DocumentStatus;
