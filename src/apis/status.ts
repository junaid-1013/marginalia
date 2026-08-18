import { JobStatus } from "@prisma/client";

export interface IChatStatus {
  status: JobStatus;
  summaryStatus: JobStatus;
  flashcardsStatus: JobStatus;
  processingError: string | null;
}

export const getChatStatus = async ({ queryKey }: any): Promise<IChatStatus> => {
  const [_, id] = queryKey;
  const response = await fetch(`/api/status?chatId=${id}`);
  if (!response.ok) throw new Error("Failed to get status");
  return response.json();
};
