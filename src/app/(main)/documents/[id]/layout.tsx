import { notFound } from "next/navigation";

import { auth } from "@/auth";
import ChatContainer from "@/components/chat/chat-container";
import { TourGuide } from "@/components/tour/tour-guide";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { getUserChat } from "@/services/db/chat";

type IProps = {
  children: React.ReactNode;
  params: { id: string };
};

const DocumentIdLayout = async ({ children, params }: IProps) => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  // also the ownership check for every tool page below
  const chat = await getUserChat(params.id, userId);
  if (!chat) notFound();

  return (
    <>
      <WorkspaceShell
        chat={{
          id: chat.id,
          name: chat.name,
          status: chat.status,
          summaryStatus: chat.summaryStatus,
          flashcardsStatus: chat.flashcardsStatus,
          quizStatus: chat.quizStatus,
          processingError: chat.processingError,
        }}
        chatPanel={<ChatContainer params={params} />}
      >
        {children}
      </WorkspaceShell>
      <TourGuide tour="workspace" userId={userId} />
    </>
  );
};

export default DocumentIdLayout;
