"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckIcon, RotateCcwIcon, XIcon } from "lucide-react";

import type { IQuizQuestion } from "@/apis/quiz";
import { Button } from "@/components/ui/button";
import { MarginNote } from "@/components/ui/margin";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

/** One round of a quiz. Missed questions can be played again as their own round. */
export const QuizRunner = ({ questions }: { questions: IQuizQuestion[] }) => {
  const [round, setRound] = useState(questions);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);

  const start = useCallback((list: IQuizQuestion[]) => {
    setRound(list);
    setIndex(0);
    setPicked(null);
    setAnswers({});
    setFinished(false);
  }, []);

  // a regenerated quiz replaces the current round
  useEffect(() => start(questions), [questions, start]);

  const q = round[index];
  const score = round.filter((x) => answers[x.id] === x.answerIndex).length;
  const missed = round.filter((x) => answers[x.id] !== x.answerIndex);

  const pick = useCallback(
    (option: number) => {
      if (picked !== null || !q) return;
      setPicked(option);
      setAnswers((a) => ({ ...a, [q.id]: option }));
    },
    [picked, q]
  );

  const next = useCallback(() => {
    if (picked === null) return;
    if (index + 1 >= round.length) setFinished(true);
    else {
      setIndex(index + 1);
      setPicked(null);
    }
  }, [index, picked, round.length]);

  // 1-4 choose an option, Enter or the right arrow moves on
  useEffect(() => {
    if (finished) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement | null)?.closest("input, textarea, [contenteditable=true]")) return;
      const n = Number(e.key);
      if (n >= 1 && n <= (q?.options.length ?? 0)) pick(n - 1);
      else if (picked !== null && (e.key === "Enter" || e.key === "ArrowRight")) next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finished, next, pick, picked, q?.options.length]);

  if (finished) {
    return (
      <div className="space-y-8">
        <div className="space-y-3 text-center">
          <p className="text-caption">Your score</p>
          <p className="font-display text-6xl font-medium tabular-nums">
            {score} / {round.length}
          </p>
          <p className="text-reading text-ink-soft">
            {missed.length === 0
              ? "Every question right. Try a new quiz to keep it fresh."
              : `${missed.length} to go over. Read the explanations below, then play just those.`}
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {missed.length > 0 && (
              <Button onClick={() => start(missed)}>
                <RotateCcwIcon className="h-4 w-4" />
                Retry the {missed.length} missed
              </Button>
            )}
            <Button variant="outline" onClick={() => start(questions)}>
              Take it again
            </Button>
          </div>
        </div>

        {missed.length > 0 && (
          <section className="space-y-5 border-t pt-6">
            <h2 className="text-heading">What you missed</h2>
            {missed.map((m) => (
              <div key={m.id} className="space-y-2">
                <h3 className="font-display text-lg leading-7">{m.question}</h3>
                <p className="flex items-start gap-2 text-sm text-destructive">
                  <XIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>You chose: {m.options[answers[m.id]]}</span>
                </p>
                <p className="flex items-start gap-2 text-sm text-success">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Correct: {m.options[m.answerIndex]}</span>
                </p>
                <MarginNote>{m.explanation}</MarginNote>
              </div>
            ))}
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-caption tabular-nums" aria-live="polite">
          Question {index + 1} of {round.length}
        </p>
        <Progress value={(index / round.length) * 100} />
      </div>

      <h2 className="font-display text-2xl leading-9 text-balance">{q.question}</h2>

      <div className="space-y-2.5" role="group" aria-label="Answers">
        {q.options.map((option, i) => {
          const isAnswer = i === q.answerIndex;
          const chosen = picked === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => pick(i)}
              disabled={picked !== null}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border bg-card px-4 py-3 text-left font-sans text-[0.9375rem] transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                picked === null && "hover:border-foreground/40 hover:bg-accent/50",
                picked !== null && isAnswer && "border-success bg-success/10",
                chosen && !isAnswer && "border-destructive bg-destructive/10",
                picked !== null && !isAnswer && !chosen && "opacity-60"
              )}
            >
              <span
                aria-hidden
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium tabular-nums text-muted-foreground"
              >
                {i + 1}
              </span>
              <span className="flex-1">{option}</span>
              {picked !== null && isAnswer && <CheckIcon className="h-4 w-4 shrink-0 text-success" />}
              {chosen && !isAnswer && <XIcon className="h-4 w-4 shrink-0 text-destructive" />}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="space-y-4" aria-live="polite">
          <MarginNote>{q.explanation}</MarginNote>
          <Button onClick={next}>{index + 1 === round.length ? "See your score" : "Next question"}</Button>
        </div>
      )}
      {picked === null && <p className="text-caption">Press 1 to {q.options.length} to answer.</p>}
    </div>
  );
};
