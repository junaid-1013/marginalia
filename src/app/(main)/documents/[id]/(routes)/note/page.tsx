"use client";

import { InboxIcon as EmptyBoxIcon, SaveIcon } from "lucide-react";

import Editor from "@/components/editor";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Block, PartialBlock } from "@blocknote/core";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { NoteGET, NotePOST } from "@/apis/note";
import { useCallback, useEffect, useState } from "react";

const DocumentNotePage = () => {
  const [isDisabled, setIsDisabled] = useState(false);

  const { id } = useParams();
  // console.log({ id }, "from note page");
  const notes = [];

  const { data: fetchedNoteString } = useQuery({
    queryKey: ["note", id],
    queryFn: NoteGET,
  });

  const { mutateAsync: saveNoteToDB, data: savedNoteString } = useMutation({
    mutationFn: NotePOST,
    onSuccess: () => {
      // console.log("GREEN CHECK icon here means COMPLETED SAVING NOTE 🚀");
    },
    onError: (e) => {
      console.error(e);
    },
  });

  // save to the db when the save button is clicked
  const handleSaveNote = async () => {
    const storageString = localStorage.getItem(`note-blocks-${id}`);
    if (!storageString) {
      return;
    }
    await saveNoteToDB({ chatId: id as string, block: storageString });
    // console.log(storageString, "storageString");
  };

  // this is for the syncing in the local storage only but not in db

  const saveToStorage = useCallback(
    (jsonBlocks: Block[]) => {
      localStorage.setItem(`note-blocks-${id}`, JSON.stringify(jsonBlocks));
    },
    [id]
  );

  async function loadFromStorage() {
    // Gets the previously stored editor contents.
    const storageString = localStorage.getItem(`note-blocks-${id}`);
    return storageString
      ? (JSON.parse(storageString) as PartialBlock[])
      : undefined;
  }

  useEffect(() => {
    if (fetchedNoteString) {
      const paresedNote = JSON.parse(fetchedNoteString);
      saveToStorage(paresedNote);
    }
  }, [fetchedNoteString, saveToStorage]);

  // const checkLocalStorageChange = () => {
  //   const localStorageNote = localStorage.getItem(`note-blocks-${id}`);
  //   if (localStorageNote !== savedNoteString) {
  //     setIsDisabled(false);
  //   }
  // };

  // useEffect(() => {
  //   // Initial check when the component mounts
  //   checkLocalStorageChange();

  //   // Set interval to check for changes every 5 seconds
  //   const interval = setInterval(() => {
  //     checkLocalStorageChange();
  //   }, 5000);

  //   // Clear interval on component unmount
  //   return () => clearInterval(interval);
  // }, [savedNoteString, savedNoteString]); // Only re-run effect if savedNoteString changes

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
                onClick={handleSaveNote}
                disabled={isDisabled}

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
              <Editor onChange={saveToStorage} loadBlock={loadFromStorage} />
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default DocumentNotePage;
