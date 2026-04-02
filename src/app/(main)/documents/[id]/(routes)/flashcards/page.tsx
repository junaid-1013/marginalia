import { InboxIcon as EmptyBoxIcon } from "lucide-react";

import { auth } from "@/auth";

const DocumentFlashcardPage = async () => {
  const session = await auth();
  // let chats:
  //   | {
  //       id: string;
  //       name: string;
  //       pdfLink: string;
  //       createdAt: Date;
  //       updatedAt: Date;
  //       userId: string;
  //     }[]
  //   | null = [];
  // if (session?.user?.id) {
  //   chats = await getUserChats(session.user.id);
  // }
  const flashcards = [];
  return (
    <>
      <main className="container py-4">
        <div className="flex justify-between pt-6">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Flashcards
          </h2>
          {/* <Link
            href="/documents/create"
            className={cn(buttonVariants({ variant: "default" }), "space-x-2")}
          >
            <PlusCircleIcon className="w-4 h-4" />
            <span>Add document</span>
          </Link> */}
        </div>
        <div className="flex flex-wrap gap-5 my-10 relative">
          {flashcards?.length == 0 && (
            <div className="absolte top-1/2 left-1/2 flex flex-col items-center justify-center w-full h-96">
              <EmptyBoxIcon className="w-24 h-24 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                No flashcards found
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default DocumentFlashcardPage;
