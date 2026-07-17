import { notFound } from "next/navigation";

import { auth } from "@/auth";
import PdfViewer from "@/components/pdf/pdf-viewer";
import { getUserChat } from "@/services/db/chat";

interface IProps {
  params: { id: string };
}

const ChatPage = async ({ params }: IProps) => {
  const session = await auth();
  if (!session?.user?.id) return null;

  const chat = await getUserChat(params.id, session.user.id);
  if (!chat) notFound();

  return <PdfViewer pdfLink={chat.pdfLink} />;
};

export default ChatPage;
