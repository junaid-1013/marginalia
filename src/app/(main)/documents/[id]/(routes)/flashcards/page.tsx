"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { RefreshCwIcon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { flashcardsAPI, getChatFlashCards } from "@/apis/flashcards";
import { FlashcardDeck } from "@/components/study/flashcard-deck";
import { StudyGate } from "@/components/study/study-gate";
import { ToolPage } from "@/components/study/tool-page";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { useDocumentStatus } from "@/hooks/use-document-status";

const DocumentFlashcardsPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data: status, flashcardsRunning, isReady } = useDocumentStatus(id as string);

  const { mutate, isPending } = useMutation({
    mutationFn: flashcardsAPI,
    // generation runs in the background, start polling the status
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["status", id] }),
    onError: () => toast.error("The flashcards could not be started. Try again."),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["flashcards-associated-with-Chat", id],
    queryFn: getChatFlashCards,
  });

  // load the flashcards as soon as the background job reports it is done
  useEffect(() => {
    if (status?.flashcardsStatus === "READY") {
      queryClient.invalidateQueries({ queryKey: ["flashcards-associated-with-Chat", id] });
    }
  }, [status?.flashcardsStatus, id, queryClient]);

  // a stable list, so the deck only restarts when the cards really change
  const cards = useMemo(
    () => (data ?? []).map((c) => ({ question: c.question, answer: c.answer })),
    [data]
  );

  const generate = () => mutate({ chatId: id as string });

  return (
    <ToolPage>
      <PageHeader
        title="Flashcards"
        description={cards.length > 0 ? `${cards.length} cards from this document` : "Cards to drill what you read."}
        actions={
          cards.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={generate}
              disabled={isPending || flashcardsRunning || !isReady}
            >
              <RefreshCwIcon className="h-4 w-4" />
              Regenerate
            </Button>
          )
        }
      />
      <StudyGate
        noun="flashcards"
        pitch="Question and answer cards written from the document. Flip each one, then say whether you knew it."
        generateLabel="Generate flashcards"
        loading={isLoading}
        hasContent={cards.length > 0}
        documentReady={isReady}
        running={flashcardsRunning}
        failed={status?.flashcardsStatus === "FAILED"}
        starting={isPending}
        onGenerate={generate}
      >
        <FlashcardDeck cards={cards} />
      </StudyGate>
    </ToolPage>
  );
};

export default DocumentFlashcardsPage;
