"use client";

import { LoaderIcon, AlertTriangleIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { processDocumentAPI } from "@/apis/process-document";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { KeyNeeded, isKeyCode } from "@/components/ai/key-needed";
import { useDocumentStatus } from "@/hooks/use-document-status";
import { reportAiError } from "@/lib/client-errors";

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
    onError: (e) => reportAiError(e, "Could not start processing. Try again."),
  });

  if (!isProcessing && !isFailed) return null;

  // the failure was about the AI key: say so, and let the person fix it and retry right here
  if (isFailed && isKeyCode(data?.errorCode)) {
    return (
      <div className="space-y-3 px-4 pt-4">
        <KeyNeeded code={data.errorCode} message={data.processingError ?? undefined} />
        <Button size="sm" variant="outline" onClick={() => retry({ chatId })} disabled={isPending}>
          Retry after updating the key
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4">
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
