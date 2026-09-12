"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChatDemo, type IMsg } from "./chat-demo";
import { DEMO_DOC, PASSAGES, QUESTIONS, type IQa } from "./demo-data";
import { DocumentPane } from "./document-pane";
import { FlashcardsDemo, QuizDemo, SummaryDemo } from "./study-demos";

type RightTab = "chat" | "summary" | "cards" | "quiz";

const TAB_LIST: { value: RightTab | "doc"; label: string }[] = [
  { value: "doc", label: "Document" },
  { value: "chat", label: "Chat" },
  { value: "summary", label: "Summary" },
  { value: "cards", label: "Flashcards" },
  { value: "quiz", label: "Quiz" },
];

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Scripted product walkthrough for the landing page. Nothing here calls the
 * API: it plays one question by itself when it scrolls into view, then it is
 * the visitor's to use.
 */
export const Demo = () => {
  const [rightTab, setRightTab] = useState<RightTab>("chat");
  // on narrow screens the document is a tab of its own instead of a left pane
  const [mobileDoc, setMobileDoc] = useState(false);
  const [messages, setMessages] = useState<IMsg[]>([]);
  const [thinking, setThinking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [asked, setAsked] = useState<string[]>([]);
  const [activeIds, setActiveIds] = useState<string[]>([]);

  const rootRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<HTMLDivElement>(null);
  const timers = useRef<{ start?: ReturnType<typeof setTimeout>; type?: ReturnType<typeof setInterval> }>({});
  const busyRef = useRef(false);
  const interacted = useRef(false);
  const autoPlayed = useRef(false);

  const clearTimers = () => {
    clearTimeout(timers.current.start);
    clearInterval(timers.current.type);
  };
  useEffect(() => clearTimers, []);

  const scrollToPassage = useCallback((id: string) => {
    const pane = docRef.current;
    const el = pane?.querySelector<HTMLElement>(`#demo-${id}`);
    if (!pane || !el) return;
    pane.scrollTo({
      top: Math.max(0, el.offsetTop - 28),
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, []);

  const ask = useCallback(
    (qa: IQa) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setBusy(true);
      setActiveIds([]);
      setAsked((a) => [...a, qa.id]);
      setMessages((m) => [
        ...m,
        { role: "user", text: qa.question },
        { role: "assistant", text: "", qa, done: false },
      ]);

      const setLast = (text: string, done: boolean) =>
        setMessages((m) => {
          const next = [...m];
          next[next.length - 1] = { ...next[next.length - 1], text, done };
          return next;
        });

      const finish = () => {
        setLast(qa.answer, true);
        setThinking(false);
        // the answer is complete: mark the passages it came from
        setActiveIds(qa.sources);
        if (qa.sources[0]) scrollToPassage(qa.sources[0]);
        busyRef.current = false;
        setBusy(false);
      };

      const reduce = prefersReducedMotion();
      setThinking(!reduce);
      timers.current.start = setTimeout(
        () => {
          if (reduce) return finish();
          setThinking(false);
          let n = 0;
          timers.current.type = setInterval(() => {
            n += 2;
            if (n >= qa.answer.length) {
              clearInterval(timers.current.type);
              finish();
            } else {
              setLast(qa.answer.slice(0, n), false);
            }
          }, 16);
        },
        reduce ? 0 : 700
      );
    },
    [scrollToPassage]
  );

  const userAsk = (qa: IQa) => {
    interacted.current = true;
    ask(qa);
  };

  // play the first question once, when the demo scrolls into view
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !autoPlayed.current && !interacted.current) {
          autoPlayed.current = true;
          setTimeout(() => {
            if (!interacted.current) ask(QUESTIONS[0]);
          }, 500);
          observer.disconnect();
        }
      },
      { threshold: 0.45 }
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [ask]);

  const cite = (qa: IQa, page: number) => {
    interacted.current = true;
    const ids = qa.sources.filter((id) => PASSAGES.find((p) => p.id === id)?.page === page);
    setActiveIds([]);
    // let the marker retract, then sweep again so the click is visible
    setTimeout(() => {
      setActiveIds(qa.sources);
      if (ids[0]) scrollToPassage(ids[0]);
    }, 60);
    setMobileDoc(true);
  };

  const tabValue = mobileDoc ? "doc" : rightTab;
  const selectTab = (v: RightTab | "doc") => {
    interacted.current = true;
    if (v === "doc") return setMobileDoc(true);
    setMobileDoc(false);
    setRightTab(v);
  };

  return (
    <div
      id="demo"
      ref={rootRef}
      className="overflow-hidden rounded-xl border bg-card"
      role="region"
      aria-label="Interactive demo"
    >
      <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5 sm:px-5">
        <p className="min-w-0 truncate font-display text-base font-semibold">{DEMO_DOC.title}</p>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant="outline" className="hidden sm:inline-flex">
            {DEMO_DOC.pages} pages
          </Badge>
          <Badge variant="success" dot>
            Ready
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] lg:h-[34rem] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <DocumentPane
          ref={docRef}
          activeIds={activeIds}
          id="demo-doc"
          className={cn(
            "h-[24rem] lg:h-full lg:border-r",
            mobileDoc ? "block order-2 lg:order-none" : "hidden lg:block"
          )}
        />

        <div className={cn("flex min-h-0 flex-col", mobileDoc && "order-1 lg:order-none")}>
          <div
            role="tablist"
            aria-label="Demo tools"
            onKeyDown={(e) => {
              // arrow keys move between tabs, like any tablist
              const tabs = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')).filter(
                (t) => t.offsetParent !== null
              );
              const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
              if (i < 0 || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
              e.preventDefault();
              const next = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
              next.focus();
              next.click();
            }}
            className="flex overflow-x-auto border-b px-2 [scrollbar-width:none] sm:px-3 [&::-webkit-scrollbar]:hidden"
          >
            {TAB_LIST.map((t) => (
              <button
                key={t.value}
                type="button"
                role="tab"
                id={`demo-tab-${t.value}`}
                aria-selected={tabValue === t.value}
                aria-controls={t.value === "doc" ? "demo-doc" : "demo-panel"}
                tabIndex={tabValue === t.value ? 0 : -1}
                onClick={() => selectTab(t.value)}
                className={cn(
                  "-mb-px shrink-0 border-b-2 border-transparent px-3 py-2 font-sans text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  tabValue === t.value && "border-highlight text-foreground",
                  t.value === "doc" && "lg:hidden"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div
            id="demo-panel"
            role="tabpanel"
            aria-labelledby={`demo-tab-${tabValue === "doc" ? rightTab : tabValue}`}
            className={cn(
              "min-h-[22rem] flex-1 overflow-hidden lg:min-h-0",
              mobileDoc && "hidden lg:block"
            )}
          >
            {rightTab === "chat" && (
              <ChatDemo
                messages={messages}
                busy={busy}
                asked={asked}
                thinking={thinking}
                onAsk={userAsk}
                onCite={cite}
              />
            )}
            {rightTab === "summary" && <SummaryDemo />}
            {rightTab === "cards" && <FlashcardsDemo />}
            {rightTab === "quiz" && <QuizDemo />}
          </div>
        </div>
      </div>
    </div>
  );
};
