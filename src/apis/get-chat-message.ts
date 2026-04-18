import { Message } from "ai";

interface IPayload {
  chatId: string;
}

export const getChatMessages = async (payload: IPayload) => {
  try {
    const response = await fetch("/api/chat-messages", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    // console.log({ payload }, "water emoji here 🌊");
    if (!response.ok) {
      throw new Error("Failed to Get Messages");
    }
    const messages = (await response.json()) as Message[];
    return messages;
  } catch (e) {
    // console.error("Error saving chat messages:", { e });
    throw new Error("Failed to Save Chat Messages");
  }
};
