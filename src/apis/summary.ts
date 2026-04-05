import { ISummary } from "@/types";

interface IPayload {
  chatId: string;
}

export const getChatSummary = async ({ queryKey }: any) => {
  const [_, id] = queryKey;
  try {
    const response = await fetch(`/api/summary?chatId=${id}`);
    if (!response.ok) {
      throw new Error("Failed to Get Chat Summary");
    }
    const summary = (await response.json()) as ISummary;
    return summary;
  } catch (e) {
    console.error("Error getting chat summary:", { e });
    throw new Error("Failed to Get Chat Summary");
  }
};
