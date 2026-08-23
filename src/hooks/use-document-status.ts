"use client";

import { useQuery } from "@tanstack/react-query";

import { getChatStatus, IChatStatus } from "@/apis/status";

const isActive = (s?: string) => s === "PENDING" || s === "PROCESSING";

/** Polls the background pipeline state while anything is still running. */
export const useDocumentStatus = (chatId: string, initial?: IChatStatus) => {
  const query = useQuery({
    queryKey: ["status", chatId],
    queryFn: getChatStatus,
    initialData: initial,
    refetchInterval: (q) => {
      const d = q.state.data;
      return d &&
        (isActive(d.status) || isActive(d.summaryStatus) || isActive(d.flashcardsStatus) || isActive(d.quizStatus))
        ? 3000
        : false;
    },
  });
  return {
    ...query,
    isProcessing: isActive(query.data?.status),
    isReady: query.data?.status === "READY",
    isFailed: query.data?.status === "FAILED",
    summaryRunning: isActive(query.data?.summaryStatus),
    flashcardsRunning: isActive(query.data?.flashcardsStatus),
    quizRunning: isActive(query.data?.quizStatus),
  };
};
