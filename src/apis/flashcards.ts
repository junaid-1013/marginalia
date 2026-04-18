import { IFlashcard } from "@/types";
import { Message } from "ai";

interface IPayload {
  chatId: string;
}

export const flashcardsAPI = async (payload: IPayload) => {
  try {
    const response = await fetch("/api/flashcards", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to Summarize");
    }
    const chat = await response.json();
    return chat;
  } catch (e) {
    console.error("Error while Summaization", { e });
    throw new Error("Failed to Summarize");
  }
};

export const getChatFlashCards = async ({ queryKey }: any) => {
  const [_, id] = queryKey;
  // console.log({ id }, "from getChatFlashCards water emoji here s🚀");
  try {
    const response = await fetch(`/api/flashcards?chatId=${id}`);
    if (!response.ok) {
      throw new Error("Failed to Get Flashcards");
    }
    const fc = (await response.json()) as IFlashcard[];
    // console.log({ fc }, "from getChatFlashCards water emoji here 🚀");
    return fc;
  } catch (e) {
    console.error("Error while getting flashcards", { e });
    throw new Error("Failed to get flashcards");
  }
};
