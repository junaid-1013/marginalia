"use client";

import { useEffect, useState } from "react";
import { CheckIcon, InboxIcon as EmptyBoxIcon, LoaderIcon, XIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getChatQuiz, quizAPI } from "@/apis/quiz";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDocumentStatus } from "@/hooks/use-document-status";
import { cn } from "@/lib/utils";

const DocumentQuizPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data: status, quizRunning, isReady } = useDocumentStatus(id as string);

  const { mutate, isPending } = useMutation({
    mutationFn: quizAPI,
    // generation runs in the background, start polling the status
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["status", id] }),
  });

  const { data: quiz } = useQuery({
    queryKey: ["quiz-associated-with-Chat", id],
    queryFn: getChatQuiz,
  });

  // load the quiz as soon as the background job reports it is done
  useEffect(() => {
    if (status?.quizStatus === "READY") {
      queryClient.invalidateQueries({ queryKey: ["quiz-associated-with-Chat", id] });
      setCurrent(0);
      setPicked(null);
      setScore(0);
    }
  }, [status?.quizStatus, id, queryClient]);

  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const hasQuiz = !!quiz && quiz.length > 0;
  const finished = hasQuiz && current >= quiz.length;
  const question = hasQuiz && !finished ? quiz[current] : null;

  const pick = (option: number) => {
    if (picked !== null || !question) return;
    setPicked(option);
    if (option === question.answerIndex) setScore((s) => s + 1);
  };
  const regenerate = () => mutate({ chatId: id as string });

  return (
    <main className="container py-4">
      <div className="sticky top-0 left-0 bg-background/80 backdrop-blur-sm z-20">
        <div className="flex justify-between py-6">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Quiz</h2>
          <Button
            onClick={regenerate}
            disabled={isPending || quizRunning || !isReady}
            variant={hasQuiz ? "outline" : "default"}
          >
            {(isPending || quizRunning) && (
              <LoaderIcon className="w-5 h-5 animate-spin mr-2" />
            )}
            {hasQuiz ? "New quiz" : "Generate quiz"}
          </Button>
        </div>
        <Separator />
      </div>

      <div className="my-10 max-w-2xl mx-auto">
        {!hasQuiz && (
          <div className="flex flex-col items-center justify-center w-full h-96">
            <EmptyBoxIcon className="w-24 h-24 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">
              {quizRunning
                ? "Generating your quiz..."
                : status?.quizStatus === "FAILED"
                ? "Quiz failed. Try again."
                : "No quiz yet"}
            </p>
          </div>
        )}

        {question && (
          <div className="space-y-6">
            <p className="text-xs text-muted-foreground">
              Question {current + 1} of {quiz!.length}
            </p>
            <h3 className="text-xl font-semibold">{question.question}</h3>
            <div className="space-y-3">
              {question.options.map((option, i) => {
                const isAnswer = i === question.answerIndex;
                return (
                  <button
                    key={i}
                    onClick={() => pick(i)}
                    disabled={picked !== null}
                    className={cn(
                      "w-full text-left rounded-lg border px-4 py-3 text-sm flex items-center justify-between transition-colors",
                      picked === null && "hover:bg-primary/5",
                      picked !== null && isAnswer && "border-green-600 bg-green-600/10",
                      picked === i && !isAnswer && "border-destructive bg-destructive/10"
                    )}
                  >
                    <span>{option}</span>
                    {picked !== null && isAnswer && <CheckIcon className="w-4 h-4 text-green-600" />}
                    {picked === i && !isAnswer && <XIcon className="w-4 h-4 text-destructive" />}
                  </button>
                );
              })}
            </div>
            {picked !== null && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{question.explanation}</p>
                <Button
                  onClick={() => {
                    setCurrent((c) => c + 1);
                    setPicked(null);
                  }}
                >
                  {current + 1 === quiz!.length ? "See result" : "Next"}
                </Button>
              </div>
            )}
          </div>
        )}

        {finished && (
          <div className="flex flex-col items-center gap-4 py-16">
            <p className="text-sm text-muted-foreground">Your score</p>
            <p className="text-5xl font-bold">
              {score} / {quiz!.length}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setCurrent(0);
                setPicked(null);
                setScore(0);
              }}
            >
              Try again
            </Button>
          </div>
        )}
      </div>
    </main>
  );
};

export default DocumentQuizPage;
