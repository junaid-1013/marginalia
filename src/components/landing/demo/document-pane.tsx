"use client";

import { forwardRef } from "react";

import { cn } from "@/lib/utils";
import { DEMO_DOC, PASSAGES } from "./demo-data";

interface IProps {
  /** passages the latest answer is based on: they get the highlighter */
  activeIds: string[];
  className?: string;
}

/**
 * A page of a document with its margin. Page numbers hang in the margin and so
 * does the note on a passage that an answer cited.
 */
export const DocumentPane = forwardRef<HTMLDivElement, IProps>(
  ({ activeIds, className }, ref) => {
    const pages = Array.from(new Set(PASSAGES.map((p) => p.page)));

    return (
      <div
        ref={ref}
        className={cn("relative overflow-y-auto bg-background", className)}
        tabIndex={0}
        aria-label={`${DEMO_DOC.title}, pages ${pages[0]} to ${pages[pages.length - 1]}`}
      >
        <div className="px-4 pb-10 pt-5 sm:px-6">
          <p className="mb-5 pl-[4.25rem] font-sans text-xs text-muted-foreground sm:pl-[5.25rem]">
            {DEMO_DOC.title}, {DEMO_DOC.chapter}
          </p>
          {pages.map((page) => (
            <section key={page} className="mb-8 last:mb-0">
              {PASSAGES.filter((p) => p.page === page).map((passage, i) => {
                const on = activeIds.includes(passage.id);
                return (
                  <div
                    key={passage.id}
                    id={`demo-${passage.id}`}
                    className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-x-4"
                  >
                    <div className="border-r border-margin/40 pr-3 pt-1 text-right font-display text-sm italic leading-5 text-ink-soft sm:pr-4">
                      {i === 0 && <span>p. {page}</span>}
                      <span
                        className={cn(
                          "block text-xs not-italic text-highlight-ink transition-opacity duration-300",
                          on ? "opacity-100" : "opacity-0"
                        )}
                        aria-hidden={!on}
                      >
                        cited
                      </span>
                    </div>
                    <p className="pb-4 font-display text-[1.0625rem] leading-[1.7rem] text-foreground">
                      <span className="mark-sweep" data-on={on}>
                        {passage.text}
                      </span>
                    </p>
                  </div>
                );
              })}
            </section>
          ))}
        </div>
      </div>
    );
  }
);
DocumentPane.displayName = "DocumentPane";
