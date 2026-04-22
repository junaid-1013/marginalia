import Link from "next/link";
import { InboxIcon as EmptyBoxIcon, PlusCircleIcon } from "lucide-react";
import { Chat } from "@prisma/client";

import { auth } from "@/auth";
import { getUserChats } from "@/services/db/chat";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const ChatsPage = async () => {
  const session = await auth();
  let chats: Chat[] | null = [];

  if (session?.user?.id) {
    chats = await getUserChats(session.user.id);
  }
  console.log("📣 chats | 📃");
  console.log("🚀 chats | 📃", { chats });
  return (
    <>
      <main className="container py-4">
        {/* <p>{JSON.stringify(session)}</p> */}
        <div className="flex justify-between pt-6">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Documents
          </h2>
          <Link
            href="/documents/create"
            className={cn(buttonVariants({ variant: "default" }), "space-x-2")}
          >
            <PlusCircleIcon className="w-4 h-4" />
            <span>Add document</span>
          </Link>
        </div>
        <div className="flex flex-wrap gap-5 my-10 relative">
          {chats?.length == 0 && (
            <div className="absolte top-1/2 left-1/2 flex flex-col items-center justify-center w-full h-96">
              <EmptyBoxIcon className="w-24 h-24 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                No documents found
              </p>
            </div>
          )}
          {chats &&
            chats.map((chat, i) => (
              <Link key={chat.id} href={`/documents/${chat.id}/view`}>
                <Card className="hover:bg-primary/5 transition-all">
                  <CardHeader>
                    <CardTitle>
                      {chat.name.length > 30
                        ? `${chat.name.slice(0, 30)}...`
                        : chat.name}
                    </CardTitle>
                    <CardDescription>
                      {chat.updatedAt.toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
        </div>
      </main>
    </>
  );
};

export default ChatsPage;
