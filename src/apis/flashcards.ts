import { ApiClientError, ensureOk } from "@/apis/errors";
import { IFlashcard } from "@/types";

interface IPayload {
  chatId: string;
}

export const flashcardsAPI = async (payload: IPayload) => {
  try {
    const response = await fetch("/api/flashcards", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    await ensureOk(response, "Failed to create flashcards");
    return await response.json();
  } catch (e) {
    if (e instanceof ApiClientError) throw e;
    throw new Error("Failed to create flashcards");
  }
};

export const getChatFlashCards = async ({ queryKey }: any) => {
  const [_, id] = queryKey;
  try {
    const response = await fetch(`/api/flashcards?chatId=${id}`);
    if (!response.ok) {
      throw new Error("Failed to Get Flashcards");
    }
    const fc = (await response.json()) as IFlashcard[];
    return fc;
  } catch (e) {
    console.error("Error while getting flashcards", { e });
    throw new Error("Failed to get flashcards");
  }
};
