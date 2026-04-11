import { InboxIcon as EmptyBoxIcon, SaveIcon } from "lucide-react";

import { auth } from "@/auth";
import Editor from "@/components/editor";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const DocumentNotePage = async () => {
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
  const notes = [];
  return (
    <>
      <main className="container py-4">
        <div className="sticky top-0 left-0 bg-background/70 backdrop-blur-sm z-20">
          <div className="flex justify-between py-6">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Note
            </h2>
            {true && (
              <Button

              // onClick={() => mutate({ chatId: id as string })}
              // disabled={isPending}
              >
                {/* {isPending && (
                <LoaderIcon className="w-5 h-5 animate-spin mr-2" />
              )} */}
                <div className="flex space-x-2 items-center justify-center">
                  <SaveIcon size={18} />
                  <span>Save</span>
                </div>
              </Button>
            )}
          </div>
          <Separator />
        </div>
        <div className="flex flex-wrap gap-5 my-10 relative z-10">
          {!true && (
            <div className="absolte top-1/2 left-1/2 flex flex-col items-center justify-center w-full h-96">
              <EmptyBoxIcon className="w-24 h-24 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">No notes found</p>
            </div>
          )}
          {true && (
            <div className="w-full h-full">
              <Editor />
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default DocumentNotePage;
