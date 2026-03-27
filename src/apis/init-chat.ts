import { Chat } from "@prisma/client";

interface IPayload {
  name: string;
  pdfLink: string;
  pdfStoragePath: string;
  userId: string;
}

export const initChat = async (chatConfig: IPayload) => {
  console.log("api -- input from init-chat", chatConfig);
  try {
    const response = await fetch("/api/init-chat", {
      method: "POST",
      body: JSON.stringify(chatConfig),
    });
    if (!response.ok) throw new Error("Failed to initialize chat");
    const chat: { chat: Chat } = await response.json();
    console.log("api -- output from init-chat", chat);
    return chat;
  } catch (e) {
    console.warn({ e }, "from init-chat.ts");
    throw new Error("Failed to initialize chat");
  }
};
