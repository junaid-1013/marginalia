"use server";
interface Params {
  [key: string]: string | string[]; // in this case its [id]
}
interface IProps {
  params: Params;
}

import ChatCard from "@/components/chat-card";
import { getUserChat } from "@/services/db/chat";

const ChatContainer = async ({ params }: IProps) => {
  const chat = await getUserChat(params.id as string);
  return <ChatCard chat={chat} />;
};

export default ChatContainer;
