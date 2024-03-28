"use server";
interface Params {
  [key: string]: string | string[]; // in this case its [id]
}
interface IProps {
  params: Params;
}

import PdfViewer from "@/components/pdf/pdf-viewer";
import { getUserChat } from "@/services/db/chat";

const ChatPage = async ({ params }: IProps) => {
  const chat = await getUserChat(params.id as string);
  console.log({ chat });
  return (
    <div className="flex gap-10 min-h-screen h-full">
      <div className="flex-1">Chat</div>
      <div className="w-px bg-black" />
      <div className="flex-1">
        {chat?.pdfUrl && <PdfViewer pdfLink={chat.pdfUrl} />}
      </div>
    </div>
  );
};

export default ChatPage;
