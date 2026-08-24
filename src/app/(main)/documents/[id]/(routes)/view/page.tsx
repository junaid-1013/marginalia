import { notFound } from "next/navigation";

import { auth } from "@/auth";
import PdfViewer from "@/components/pdf/pdf-viewer";
import { getUserChat } from "@/services/db/chat";

interface IProps {
  params: { id: string };
  searchParams: { page?: string };
}

const ChatPage = async ({ params, searchParams }: IProps) => {
  const session = await auth();
  if (!session?.user?.id) return null;

  const chat = await getUserChat(params.id, session.user.id);
  if (!chat) notFound();

  const page = Number.parseInt(searchParams.page ?? "", 10);
  return (
    <PdfViewer chatId={chat.id} page={page > 0 ? page : undefined} />
  );
};

export default ChatPage;
