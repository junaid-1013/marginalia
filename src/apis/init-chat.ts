import { Chat } from "@prisma/client";

interface IPayload {
  name: string;
  pdfLink: string;
  pdfStoragePath: string;
  userId: string;
}

export const initChatAPI = async (chatConfig: IPayload) => {
  try {
    const response = await fetch("/api/init-chat", {
      method: "POST",
      body: JSON.stringify(chatConfig),
    });
    if (!response.ok) throw new Error("Failed to initialize chat");
    const chat: { chat: Chat } = await response.json();
    return chat;
  } catch (e) {
    throw new Error("Failed to initialize chat");
  }
};
