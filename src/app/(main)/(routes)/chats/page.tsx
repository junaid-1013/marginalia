import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { auth } from "@/auth";
import { getUserChats } from "@/services/db/chat";

const ChatsPage = async () => {
  const session = await auth();
  let chats:
    | {
        id: string;
        name: string;
        pdfUrl: string;
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
        <p>{JSON.stringify(session)}</p>
        <div className="flex gap-10 my-10">
          <button className="border border-black aspect-square w-40 rounded-md cursor-pointer">
            <Link
              href="/create"
              className="bg-red-500 w-full h-full flex items-center  justify-center"
            >
              <PlusIcon className="text-amber-950 w-10 h-10" />
            </Link>
          </button>
          {chats &&
            chats.map((chat) => (
              <div
                key={chat.id}
                className="border border-black aspect-square w-40 rounded-md cursor-pointer"
              >
                <Link
                  href={`/chats/${chat.id}`}
                  className="bg-red-500 w-full h-full flex items-center  justify-center"
                >
                  {/* style as name, id and created at in  a professional way like nname is bigger and meta deta is smaller */}
                  <p>{chat.name}</p>
                </Link>
              </div>
            ))}
        </div>
      </main>
    </>
  );
};

export default ChatsPage;
