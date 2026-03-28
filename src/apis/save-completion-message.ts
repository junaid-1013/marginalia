import { Message } from "ai";

interface IPayload {
  chatId: string;
  message: Message;
}

export const saveCompletionMessage = async (payload: IPayload) => {
  try {
    const response = await fetch("/api/save-completion-message", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    console.log({ payload }, "water emoji here 🌊");
    if (!response.ok) {
      throw new Error("Failed to Save Chat Messages");
    }
    const chat = await response.json();
    return chat;
  } catch (e) {
    console.error("Error saving chat messages:", { e });
    throw new Error("Failed to Save Chat Messages");
  }
};
