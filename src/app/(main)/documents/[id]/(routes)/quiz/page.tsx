"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { RefreshCwIcon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reportAiError } from "@/lib/client-errors";

import { getChatQuiz, quizAPI } from "@/apis/quiz";
import { QuizRunner } from "@/components/study/quiz-runner";
import { StudyGate } from "@/components/study/study-gate";
import { ToolPage } from "@/components/study/tool-page";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { useDocumentStatus } from "@/hooks/use-document-status";

const DocumentQuizPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data: status, quizRunning, isReady } = useDocumentStatus(id as string);

  const { mutate, isPending } = useMutation({
    mutationFn: quizAPI,
    // generation runs in the background, start polling the status
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["status", id] }),
    onError: (e) => reportAiError(e, "The quiz could not be started. Try again."),
  });

  const { data: quiz, isLoading } = useQuery({
    queryKey: ["quiz-associated-with-Chat", id],
    queryFn: getChatQuiz,
  });

  // load the quiz as soon as the background job reports it is done
  useEffect(() => {
    if (status?.quizStatus === "READY") {
      queryClient.invalidateQueries({ queryKey: ["quiz-associated-with-Chat", id] });
    }
  }, [status?.quizStatus, id, queryClient]);

  const hasQuiz = !!quiz && quiz.length > 0;
  const generate = () => mutate({ chatId: id as string });

  return (
    <ToolPage className="max-w-2xl">
      <PageHeader
        title="Quiz"
        description={hasQuiz ? `${quiz.length} questions on this document` : "Test yourself on what you read."}
        actions={
          hasQuiz && (
            <Button variant="outline" size="sm" onClick={generate} disabled={isPending || quizRunning || !isReady}>
              <RefreshCwIcon className="h-4 w-4" />
              New quiz
            </Button>
          )
        }
      />
      <StudyGate
        noun="quiz"
        pitch="Multiple-choice questions with explanations, written from the document, with a score at the end."
        generateLabel="Generate quiz"
        loading={isLoading}
        hasContent={hasQuiz}
        documentReady={isReady}
        running={quizRunning}
        failed={status?.quizStatus === "FAILED"}
        errorCode={status?.errorCode}
        starting={isPending}
        onGenerate={generate}
      >
        {hasQuiz && <QuizRunner questions={quiz} />}
      </StudyGate>
    </ToolPage>
  );
};

export default DocumentQuizPage;
