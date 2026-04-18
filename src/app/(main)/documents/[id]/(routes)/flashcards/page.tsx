"use client";

import { InboxIcon as EmptyBoxIcon, LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FlashcardArray } from "react-quizlet-flashcard";

import { Button } from "@/components/ui/button";
import { flashcardsAPI, getChatFlashCards } from "@/apis/flashcards";

const DocumentFlashcardsPage = () => {
  const { id } = useParams();

  const { mutate, data, isPending } = useMutation({
    mutationFn: flashcardsAPI,
    onSuccess: (data) => {
      // console.log("data", data);
    },
    onError: (error) => {
      console.error("error", error);
    },
  });

  const { data: flashcardsData } = useQuery({
    queryKey: ["flashcards-associated-with-Chat", id],
    queryFn: getChatFlashCards,
  });
  // console.log({ flashcardsData });
  return (
    <>
      <main className="container py-4">
        <div className="flex justify-between pt-6">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Flashcards
          </h2>
          {/* if summary not available, so generate */}
          {!(flashcardsData && flashcardsData.length > 0) && (
            <Button
              onClick={() => mutate({ chatId: id as string })}
              disabled={isPending}
            >
              {isPending && (
                <LoaderIcon className="w-5 h-5 animate-spin mr-2" />
              )}
              Get Flashcards
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-5 my-10 relative">
          {!(flashcardsData && flashcardsData.length > 0) && (
            <div className="absolte top-1/2 left-1/2 flex flex-col items-center justify-center w-full h-96">
              <EmptyBoxIcon className="w-24 h-24 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                No Flashcards found
              </p>
            </div>
          )}
          {flashcardsData && flashcardsData.length > 0 && (
            <div className="mx-auto text-foreground stroke-foreground">
              <FlashcardArray
                cycle={true}
                cards={flashcardsData.map((flashcard, i) => {
                  return {
                    id: i,
                    frontHTML: flashcard.question,
                    backHTML: flashcard.answer,
                  };
                })}
                frontCardStyle={{
                  backgroundColor: "lightblue",
                  borderRadius: "8px",
                  padding: "20px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                }}
                backCardStyle={{
                  backgroundColor: "lightgreen",
                  borderRadius: "8px",
                  padding: "20px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                }}
                frontContentStyle={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "black",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                }}
                backContentStyle={{
                  fontSize: "14px",
                  color: "black",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  flex: "1",
                }}
                FlashcardArrayStyle={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              />
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default DocumentFlashcardsPage;
