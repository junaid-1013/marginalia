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
  return (
    <div className="flex max-h-[calc(100vh-81px)] min-h-[calc(100vh-81px)] h-full">
      <div className="flex-1 w-1/2 max-h-screen">
        <ChatCard chat={chat} />
      </div>
      <div className="w-px bg-black" />
      <div className="flex-1 w-1/2">
        {chat?.pdfLink && <PdfViewer pdfLink={chat.pdfLink} />}
      </div>
    </div>
  );
};

export default ChatPage;
