import { Chat } from "@prisma/client";

interface IPayload {
  name: string;
  pdfLink: string;
  pdfStoragePath: string;
}

export const initChatAPI = async (chatConfig: IPayload) => {
  try {
    const response = await fetch("/api/init-chat", {
      method: "POST",
      body: JSON.stringify(chatConfig),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error ?? "Failed to initialize chat");
    }
    const chat: { chat: Chat } = await response.json();
    return chat;
  } catch (e) {
    // keep the server's message (e.g. duplicate name) for the toast
    throw e instanceof Error ? e : new Error("Failed to initialize chat");
  }
};
