import { auth } from "@/auth";
import ChatContainer from "@/components/chat/chat-container";
import DocumentStatus from "@/components/document-status";
import SideNav from "@/components/layout/document/sidenav";
import { TourGuide } from "@/components/tour/tour-guide";
import { Separator } from "@/components/ui/separator";
import React from "react";

type IProps = {
  children: React.ReactNode;
  params: { id: string };
};

const DocumentIdLayout = async ({ children, params }: IProps) => {
  const session = await auth();
  return (
    <div className="flex max-h-[calc(100vh-65px)] min-h-[calc(100vh-65px)] h-full">
      <SideNav params={params} />
      {session?.user?.id && <TourGuide tour="workspace" userId={session.user.id} />}
      <div className="flex-1 w-2/3 max-h-[calc(100vh-65px)] min-h-[calc(100vh-65px)] overflow-y-auto">
        <DocumentStatus chatId={params.id} />
        {children}
      </div>
      {/* <div className="w-px bg-black" /> */}
      <div>
        <Separator orientation="vertical" className="h-full" />
      </div>
      <div className="w-1/3" data-tour="chat">
        <ChatContainer params={params} />
      </div>
    </div>
  );
};

export default DocumentIdLayout;
