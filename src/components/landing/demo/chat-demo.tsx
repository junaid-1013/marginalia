"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PASSAGES, QUESTIONS, type IQa } from "./demo-data";

export interface IMsg {
  role: "user" | "assistant";
  text: string;
  qa?: IQa;
  done?: boolean;
}

interface IProps {
  messages: IMsg[];
  busy: boolean;
  asked: string[];
  thinking: boolean;
  onAsk: (qa: IQa) => void;
  /** a citation chip was clicked: page of the passages to show */
  onCite: (qa: IQa, page: number) => void;
}

const pagesOf = (qa: IQa) =>
  Array.from(
    new Set(
      qa.sources
        .map((id) => PASSAGES.find((p) => p.id === id)?.page)
        .filter((p): p is number => !!p)
    )
  ).sort((a, b) => a - b);

export const ChatDemo = ({ messages, busy, asked, thinking, onAsk, onCite }: IProps) => {
  const remaining = QUESTIONS.filter((q) => !asked.includes(q.id));
  const listRef = useRef<HTMLDivElement>(null);

  // keep the newest line in view while the answer types out
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, thinking]);

  return (
    <div className="flex h-full flex-col">
      <div
        ref={listRef}
        className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <p className="font-display text-[1.0625rem] italic leading-7 text-ink-soft">
            Ask about this chapter. Pick a question to see how an answer points back to its page.
          </p>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div
              key={i}
              className="ml-auto w-fit max-w-[88%] rounded-lg bg-primary px-3.5 py-2 font-sans text-sm text-primary-foreground"
            >
              {m.text}
            </div>
          ) : (
            <div key={i} className="max-w-[94%] space-y-2.5">
              {m.text === "" && thinking ? (
                <p className="font-sans text-sm text-muted-foreground">Reading the chapter...</p>
              ) : (
                <p className="font-display text-[1.0625rem] leading-7 text-foreground">{m.text}</p>
              )}
              {m.done && m.qa && m.qa.sources.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-sans text-xs text-muted-foreground">Sources</span>
                  {pagesOf(m.qa).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => onCite(m.qa!, page)}
                      className="mark-hl rounded-sm px-1.5 font-sans text-xs font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      p. {page}
                    </button>
                  ))}
                </div>
              )}
              {m.done && m.qa && m.qa.sources.length === 0 && (
                <p className="font-sans text-xs text-muted-foreground">No source: nothing in the document answers this.</p>
              )}
            </div>
          )
        )}
      </div>

      <div className={cn("border-t bg-card/60 px-4 py-3 sm:px-5", remaining.length === 0 && "hidden")}>
        <p className="mb-2 font-sans text-xs text-muted-foreground">
          {messages.length === 0 ? "Try a question" : "Ask another"}
        </p>
        <div className="flex flex-wrap gap-2">
          {remaining.map((q) => (
            <Button
              key={q.id}
              type="button"
              variant="outline"
              size="sm"
              className="h-auto whitespace-normal py-1.5 text-left"
              disabled={busy}
              onClick={() => onAsk(q)}
            >
              {q.question}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
