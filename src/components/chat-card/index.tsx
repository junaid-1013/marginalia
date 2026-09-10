"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "ai/react";
import { type Message } from "ai";
import { type Chat } from "@prisma/client";
import { CopyIcon, RefreshCwIcon, SendIcon, SquareIcon } from "lucide-react";
import { toast } from "sonner";

import { Markdown, CitationChip } from "@/components/chat/markdown";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { Button } from "@/components/ui/button";
import { useDocumentStatus } from "@/hooks/use-document-status";
import { cn } from "@/lib/utils";

const STARTERS = [
  "What is this document about?",
  "List the key terms and define them.",
  "What are the main arguments or conclusions?",
];

type Props = {
  chat: Chat | null;
  initialMessages?: Message[];
};

const sourcePages = (annotations?: unknown[]) => {
  const sources = (annotations as { sources?: { page: number | null }[] }[] | undefined)?.find(
    (a) => a?.sources
  )?.sources;
  return Array.from(
    new Set((sources ?? []).map((s) => s.page).filter((p): p is number => !!p))
  ).sort((a, b) => a - b);
};

const ChatCard = ({ chat, initialMessages }: Props) => {
  const router = useRouter();
  const { closeChat } = useWorkspace();
  const chatId = chat?.id ?? "";

  const { isReady, isFailed, data: status } = useDocumentStatus(
    chatId,
    chat
      ? {
          status: chat.status,
          summaryStatus: chat.summaryStatus,
          flashcardsStatus: chat.flashcardsStatus,
          quizStatus: chat.quizStatus,
          processingError: chat.processingError,
        }
      : undefined
  );

  const { messages, input, setInput, handleSubmit, append, reload, stop, status: chatStatus, error } =
    useChat({
      api: "/api/chat",
      // the server saves both sides of the conversation itself
      body: { chatId },
      initialMessages,
    });

  const busy = chatStatus === "submitted" || chatStatus === "streaming";

  // ---- scrolling: follow the answer unless the reader scrolled up ----------
  const listRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  useEffect(() => {
    const el = listRef.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [messages, chatStatus]);
  const onScroll = () => {
    const el = listRef.current;
    if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  // ---- input: grows with the text, Enter sends, Shift+Enter breaks the line ----
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [input]);

  // "/" anywhere in the workspace focuses the chat (the shell dispatches this)
  useEffect(() => {
    const focus = () => inputRef.current?.focus();
    window.addEventListener("marginalia:focus-chat", focus);
    return () => window.removeEventListener("marginalia:focus-chat", focus);
  }, []);

  const openPage = useCallback(
    (page: number) => {
      closeChat();
      router.push(`/documents/${chatId}/view?page=${page}`);
    },
    [chatId, closeChat, router]
  );

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Answer copied.");
    } catch {
      toast.error("Could not copy. Select the text and copy it manually.");
    }
  };

  const ask = (content: string) => {
    stick.current = true;
    append({ role: "user", content });
  };

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant")?.id;
  const canSend = isReady && !busy && input.trim().length > 0;

  const disabledReason = isFailed
    ? "This document could not be read, so chat is off. Retry from the banner above the document."
    : !isReady
    ? "Marginalia is still reading this document. Chat unlocks when it is ready."
    : null;

  return (
    <section className="flex h-full min-h-0 flex-col bg-background" aria-label="Chat">
      <header className="shrink-0 border-b px-4 py-3">
        <h2 className="text-heading">Chat</h2>
        <p className="text-caption">Answers come from this document and cite their pages.</p>
      </header>

      <div
        ref={listRef}
        onScroll={onScroll}
        className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-5"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <div className="space-y-4">
            <p className="font-display text-[1.0625rem] italic leading-7 text-ink-soft">
              {isReady
                ? "Ask anything about this document. Answers point to the pages they came from."
                : "Chat opens as soon as Marginalia has read the document."}
            </p>
            {isReady && (
              <div className="flex flex-col items-start gap-2">
                {STARTERS.map((q) => (
                  <Button
                    key={q}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-auto whitespace-normal py-1.5 text-left"
                    disabled={busy}
                    onClick={() => ask(q)}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((m) =>
          m.role === "user" ? (
            <div
              key={m.id}
              className="ml-auto w-fit max-w-[88%] whitespace-pre-wrap rounded-lg bg-primary px-3.5 py-2 font-sans text-sm text-primary-foreground"
            >
              {m.content}
            </div>
          ) : (
            <div key={m.id} className="group border-l-2 border-margin/50 pl-3.5">
              <Markdown text={m.content} onCite={openPage} />
              {sourcePages(m.annotations).length > 0 && (
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 font-sans text-xs text-muted-foreground">
                  <span>Sources</span>
                  {sourcePages(m.annotations).map((p) => (
                    <CitationChip key={p} onClick={() => openPage(p)}>
                      p. {p}
                    </CitationChip>
                  ))}
                </div>
              )}
              {!(busy && m.id === lastAssistant) && (
                <div className="mt-2 flex items-center gap-1 lg:opacity-0 lg:transition-opacity lg:group-focus-within:opacity-100 lg:group-hover:opacity-100">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-muted-foreground"
                    onClick={() => copy(m.content)}
                  >
                    <CopyIcon className="h-3.5 w-3.5" />
                    Copy
                  </Button>
                  {m.id === lastAssistant && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-muted-foreground"
                      onClick={() => reload()}
                    >
                      <RefreshCwIcon className="h-3.5 w-3.5" />
                      Regenerate
                    </Button>
                  )}
                </div>
              )}
            </div>
          )
        )}

        {chatStatus === "submitted" && (
          <p className="border-l-2 border-margin/50 pl-3.5 font-sans text-sm text-muted-foreground">
            Reading the document...
          </p>
        )}
        {error && (
          <div className="flex items-center justify-between gap-3 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            <span>The answer did not come through.</span>
            <Button type="button" size="sm" variant="outline" onClick={() => reload()}>
              Try again
            </Button>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t bg-card/60 p-3">
        <form
          ref={formRef}
          onSubmit={(e) => {
            stick.current = true;
            handleSubmit(e);
          }}
          className="flex items-end gap-2"
        >
          <textarea
            ref={inputRef}
            value={input}
            rows={1}
            disabled={!isReady}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                if (canSend) formRef.current?.requestSubmit();
              }
            }}
            placeholder={isReady ? "Ask about this document" : "Chat is not available yet"}
            aria-label="Message"
            className={cn(
              "min-h-10 flex-1 resize-none rounded-md border border-input bg-sunken px-3 py-2 font-sans text-sm transition-colors duration-150 placeholder:text-muted-foreground focus:border-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            )}
          />
          {busy ? (
            <Button type="button" size="icon" variant="outline" onClick={() => stop()} aria-label="Stop answering">
              <SquareIcon className="h-4 w-4 fill-current" />
            </Button>
          ) : (
            <Button type="submit" size="icon" disabled={!canSend} aria-label="Send message">
              <SendIcon className="h-4 w-4" />
            </Button>
          )}
        </form>
        <p className="mt-2 text-caption">
          {disabledReason ?? (
            <>
              Enter to send, Shift+Enter for a new line.
              <span className="hidden lg:inline"> Press / to jump here.</span>
            </>
          )}
        </p>
        {status?.processingError && isFailed && (
          <p className="mt-1 text-caption text-destructive">{status.processingError}</p>
        )}
      </div>
    </section>
  );
};

export default ChatCard;
