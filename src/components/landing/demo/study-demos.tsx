"use client";

import { useState } from "react";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FLASHCARDS, QUIZ, SUMMARY } from "./demo-data";

export const SummaryDemo = () => (
  <div className="h-full space-y-5 overflow-y-auto px-4 py-4 sm:px-5">
    <p className="font-display text-xl leading-8 text-foreground">
      <span className="mark-hl">{SUMMARY.tldr}</span>
    </p>
    <div className="space-y-3">
      <h3 className="font-sans text-sm font-semibold">Key takeaways</h3>
      <ul className="space-y-2.5">
        {SUMMARY.takeaways.map((t) => (
          <li
            key={t}
            className="border-l-2 border-margin/50 pl-3 font-display text-[1.0625rem] leading-7 text-foreground"
          >
            {t}
          </li>
        ))}
      </ul>
    </div>
    <div className="space-y-2">
      <h3 className="font-sans text-sm font-semibold">Most used terms</h3>
      <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1 font-display text-ink-soft">
        {SUMMARY.terms.map((t, i) => (
          <span key={t} style={{ fontSize: `${1.5 - i * 0.18}rem` }}>
            {t}
          </span>
        ))}
      </p>
    </div>
  </div>
);

export const FlashcardsDemo = () => {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = FLASHCARDS[i];
  const go = (d: number) => {
    setFlipped(false);
    setI((n) => (n + d + FLASHCARDS.length) % FLASHCARDS.length);
  };

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-4 py-4 sm:px-6">
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? "Show the question" : "Show the answer"}
        className="group h-52 w-full max-w-sm [perspective:1000px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg"
      >
        <span
          className={cn(
            "relative block h-full w-full transition-transform duration-500 ease-out [transform-style:preserve-3d] motion-reduce:duration-0",
            flipped && "[transform:rotateY(180deg)]"
          )}
        >
          <span className="absolute inset-0 flex flex-col justify-between rounded-lg border bg-card p-5 text-left [backface-visibility:hidden]">
            <span className="font-sans text-xs text-muted-foreground">Question</span>
            <span className="font-display text-xl leading-7 text-foreground">{card.q}</span>
            <span className="font-sans text-xs text-muted-foreground">Click to reveal</span>
          </span>
          <span className="absolute inset-0 flex flex-col justify-between rounded-lg border bg-accent p-5 text-left [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <span className="font-sans text-xs text-highlight-ink">Answer</span>
            <span className="font-display text-xl leading-7 text-foreground">{card.a}</span>
            <span className="font-sans text-xs text-ink-soft">p. {card.page}</span>
          </span>
        </span>
      </button>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => go(-1)} aria-label="Previous card">
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <span className="min-w-14 text-center font-sans text-sm tabular-nums text-muted-foreground">
          {i + 1} of {FLASHCARDS.length}
        </span>
        <Button variant="outline" size="icon" onClick={() => go(1)} aria-label="Next card">
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export const QuizDemo = () => {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const done = i >= QUIZ.length;
  const q = done ? null : QUIZ[i];

  const pick = (n: number) => {
    if (picked !== null || !q) return;
    setPicked(n);
    if (n === q.answer) setScore((s) => s + 1);
  };
  const restart = () => {
    setI(0);
    setPicked(null);
    setScore(0);
  };

  if (done) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-4 py-6">
        <p className="font-sans text-sm text-muted-foreground">Your score</p>
        <p className="font-display text-5xl tabular-nums">
          {score} / {QUIZ.length}
        </p>
        <Button variant="outline" size="sm" onClick={restart}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
      <p className="font-sans text-xs tabular-nums text-muted-foreground">
        Question {i + 1} of {QUIZ.length}
      </p>
      <h3 className="font-display text-xl leading-7">{q!.q}</h3>
      <div className="space-y-2">
        {q!.options.map((o, n) => {
          const isAnswer = n === q!.answer;
          return (
            <button
              key={o}
              type="button"
              onClick={() => pick(n)}
              disabled={picked !== null}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-md border bg-card px-3.5 py-2.5 text-left font-sans text-sm transition-colors duration-150",
                picked === null && "hover:bg-accent",
                picked !== null && isAnswer && "border-success bg-success/10",
                picked === n && !isAnswer && "border-destructive bg-destructive/10"
              )}
            >
              <span>{o}</span>
              {picked !== null && isAnswer && <CheckIcon className="h-4 w-4 shrink-0 text-success" />}
              {picked === n && !isAnswer && <XIcon className="h-4 w-4 shrink-0 text-destructive" />}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="space-y-3">
          <p className="border-l-2 border-margin/50 pl-3 font-display text-[0.9375rem] italic leading-6 text-ink-soft">
            {q!.why}
          </p>
          <Button
            size="sm"
            onClick={() => {
              setI((n) => n + 1);
              setPicked(null);
            }}
          >
            {i + 1 === QUIZ.length ? "See result" : "Next question"}
          </Button>
        </div>
      )}
    </div>
  );
};
