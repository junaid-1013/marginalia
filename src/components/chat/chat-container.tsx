import { type Message } from "ai";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import ChatCard from "@/components/chat-card";
import { getChatMessages, getUserChat } from "@/services/db/chat";

interface IProps {
  params: { id: string };
}

const ChatContainer = async ({ params }: IProps) => {
  const session = await auth();
  if (!session?.user?.id) return null;

  const chat = await getUserChat(params.id, session.user.id);
  if (!chat) notFound();

  const messages = await getChatMessages(chat.id);
  return (
    <ChatCard
      chat={chat}
      initialMessages={messages.map((m) => ({
        id: m.id,
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
        createdAt: m.createdAt,
        annotations: m.sources ? [{ sources: m.sources }] : undefined,
      })) as Message[]}
    />
  );
};

export default ChatContainer;
