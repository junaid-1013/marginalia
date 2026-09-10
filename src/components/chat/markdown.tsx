"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { linkCitations, pageFromHref } from "@/lib/citations";

/** A page reference inside an answer: highlighter text that opens the PDF at that page. */
export const CitationChip = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="mark-hl rounded-sm px-0.5 font-sans text-[0.8125em] font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    {children}
  </button>
);

/**
 * Renders an answer as markdown (raw HTML is never rendered) and turns page
 * references like "(p. 3)" into clickable chips.
 */
export const Markdown = ({
  text,
  onCite,
}: {
  text: string;
  onCite: (page: number) => void;
}) => (
  <div className="text-reading space-y-3 [&>*:last-child]:mb-0">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children }) => {
          const page = pageFromHref(href);
          if (page) return <CitationChip onClick={() => onCite(page)}>{children}</CitationChip>;
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-highlight decoration-2 underline-offset-4 hover:bg-accent"
            >
              {children}
            </a>
          );
        },
        p: ({ children }) => <p>{children}</p>,
        ul: ({ children }) => <ul className="list-disc space-y-1.5 pl-5 marker:text-margin">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal space-y-1.5 pl-5 marker:text-muted-foreground">{children}</ol>,
        h1: ({ children }) => <h3 className="text-heading">{children}</h3>,
        h2: ({ children }) => <h3 className="text-heading">{children}</h3>,
        h3: ({ children }) => <h4 className="font-display text-base font-semibold">{children}</h4>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-margin/50 pl-3 italic text-ink-soft">{children}</blockquote>
        ),
        code: ({ children }) => (
          <code className="rounded bg-secondary px-1 py-0.5 font-mono text-[0.85em]">{children}</code>
        ),
        pre: ({ children }) => (
          <pre className="overflow-x-auto rounded-md bg-secondary p-3 font-mono text-[0.85em] leading-6 [&_code]:bg-transparent [&_code]:p-0">
            {children}
          </pre>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-sans text-sm">{children}</table>
          </div>
        ),
        th: ({ children }) => <th className="border-b px-2 py-1.5 text-left font-semibold">{children}</th>,
        td: ({ children }) => <td className="border-b px-2 py-1.5">{children}</td>,
      }}
    >
      {linkCitations(text)}
    </ReactMarkdown>
  </div>
);
