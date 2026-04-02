"use server";
interface Params {
  [key: string]: string | string[]; // in this case its [id]
}
interface IProps {
  params: Params;
}

import ChatCard from "@/components/chat-card";
import PdfViewer from "@/components/pdf/pdf-viewer";
import { getUserChat } from "@/services/db/chat";

const ChatPage = async ({ params }: IProps) => {
  const chat = await getUserChat(params.id as string);
  if (!chat) {
    return null;
  }
  return <PdfViewer pdfLink={chat.pdfLink} />;
};

export default ChatPage;
