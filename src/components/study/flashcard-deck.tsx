"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckIcon, RotateCcwIcon, ShuffleIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface IFlashcard {
  question: string;
  answer: string;
}

const shuffled = <T,>(items: T[]) => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * Active recall, not a slideshow: flip the card, then say whether you knew
 * it. The cards you missed come back as their own round.
 */
export const FlashcardDeck = ({ cards }: { cards: IFlashcard[] }) => {
  const [deck, setDeck] = useState(cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [missed, setMissed] = useState<IFlashcard[]>([]);
  const [known, setKnown] = useState(0);
  const [finished, setFinished] = useState(false);

  const start = useCallback((list: IFlashcard[]) => {
    setDeck(list);
    setIndex(0);
    setFlipped(false);
    setMissed([]);
    setKnown(0);
    setFinished(false);
  }, []);

  // a regenerated deck replaces the current round
  useEffect(() => start(cards), [cards, start]);

  const card = deck[index];

  const rate = useCallback(
    (knew: boolean) => {
      if (!card) return;
      if (knew) setKnown((k) => k + 1);
      else setMissed((m) => [...m, card]);
      if (index + 1 >= deck.length) setFinished(true);
      else {
        setIndex(index + 1);
        setFlipped(false);
      }
    },
    [card, deck.length, index]
  );

  // Space flips, then left means missed it and right means got it
  useEffect(() => {
    if (finished) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement | null)?.closest("input, textarea, [contenteditable=true]")) return;
      if (e.key === " " && (e.target as HTMLElement | null)?.tagName !== "BUTTON") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && e.key === "ArrowLeft") rate(false);
      else if (flipped && e.key === "ArrowRight") rate(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finished, flipped, rate]);

  if (finished) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-5 py-10 text-center">
        <p className="text-caption">Round complete</p>
        <p className="font-display text-5xl font-medium tabular-nums">
          {known} of {deck.length}
        </p>
        <p className="text-reading text-ink-soft">
          {missed.length === 0
            ? "You knew every card in this round."
            : `You missed ${missed.length}. Going over them again is where most of the learning happens.`}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {missed.length > 0 && (
            <Button onClick={() => start(missed)}>
              <RotateCcwIcon className="h-4 w-4" />
              Review the {missed.length} missed
            </Button>
          )}
          <Button variant="outline" onClick={() => start(cards)}>
            Start over
          </Button>
          <Button variant="outline" onClick={() => start(shuffled(cards))}>
            <ShuffleIcon className="h-4 w-4" />
            Shuffle and restart
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-caption tabular-nums" aria-live="polite">
            Card {index + 1} of {deck.length}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => start(shuffled(deck))}
          >
            <ShuffleIcon className="h-4 w-4" />
            Shuffle
          </Button>
        </div>
        <Progress value={(index / deck.length) * 100} aria-label="Deck progress" />
      </div>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? "Show the question" : "Show the answer"}
        className="h-72 w-full rounded-xl text-left [perspective:1200px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:h-80"
      >
        <span
          className={cn(
            "relative block h-full w-full transition-transform duration-500 ease-out [transform-style:preserve-3d] motion-reduce:duration-0",
            flipped && "[transform:rotateY(180deg)]"
          )}
        >
          <span className="absolute inset-0 flex flex-col justify-between rounded-xl border bg-card p-6 [backface-visibility:hidden]">
            <span className="text-caption">Question</span>
            <span className="font-display text-2xl leading-9 text-foreground">{card.question}</span>
            <span className="text-caption">Click or press Space to reveal</span>
          </span>
          <span className="absolute inset-0 flex flex-col justify-between rounded-xl border bg-accent p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <span className="font-sans text-[0.8125rem] font-medium text-highlight-ink">Answer</span>
            <span className="font-display text-xl leading-8 text-accent-foreground">{card.answer}</span>
            <span aria-hidden className="h-4" />
          </span>
        </span>
      </button>

      <div className={cn("grid grid-cols-2 gap-3 transition-opacity", !flipped && "pointer-events-none opacity-40")}>
        <Button variant="outline" size="lg" onClick={() => rate(false)} disabled={!flipped}>
          <XIcon className="h-4 w-4 text-destructive" />
          Missed it
        </Button>
        <Button size="lg" onClick={() => rate(true)} disabled={!flipped}>
          <CheckIcon className="h-4 w-4" />
          Got it
        </Button>
      </div>
      <p className="text-caption">Space flips the card. Then left arrow means missed it and right arrow means got it.</p>
    </div>
  );
};
