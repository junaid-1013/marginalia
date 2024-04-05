import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { auth } from "@/auth";
import { getUserChats } from "@/services/db/chat";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const ChatsPage = async () => {
  const session = await auth();
  let chats:
    | {
        id: string;
        name: string;
        pdfLink: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
      }[]
    | null = [];
  if (session?.user?.id) {
    chats = await getUserChats(session.user.id);
  }

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
            className={cn(buttonVariants({ variant: "default" }))}
          >
            Create Chat
          </Link>
        </div>
        <div className="flex gap-5 my-10">
          {/* <Link
            href="/documents/create"
            className={cn(
              buttonVariants({ variant: "default" }),
              "flex h-full"
            )}
          >
            <PlusIcon className="w-10 h-10" />
          </Link> */}
          {chats &&
            chats.map((chat, i) => (
              <Link key={chat.id} href={`/documents/${chat.id}/chat`}>
                <Card className="hover:bg-primary/5 transition-all">
                  <CardHeader>
                    <CardTitle>
                      {chat.name.length > 30
                        ? `${chat.name.slice(0, 30)}...`
                        : chat.name}
                    </CardTitle>
                    <CardDescription>
                      {/* create the chat.updateAt as date to make a readable string as the description */}
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
