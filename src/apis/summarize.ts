import { Message } from "ai";

interface IPayload {
  chatId: string;
}

export const summarize = async (payload: IPayload) => {
  try {
    const response = await fetch("/api/summarize", {
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
