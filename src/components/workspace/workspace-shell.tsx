"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronLeftIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  MessageSquareIcon,
} from "lucide-react";

import DocumentStatus from "@/components/document-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useDocumentStatus } from "@/hooks/use-document-status";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { TOOLS } from "./nav-items";
import { WorkspaceProvider } from "./workspace-context";
import type { IChatStatus } from "@/apis/status";

interface IProps {
  chat: { id: string; name: string } & IChatStatus;
  /** the chat, rendered on the server */
  chatPanel: React.ReactNode;
  /** the active tool page */
  children: React.ReactNode;
}

const RAIL_KEY = "marginalia.rail.collapsed";

const StatusBadge = ({ chatId, initial }: { chatId: string; initial: IChatStatus }) => {
  const { data } = useDocumentStatus(chatId, initial);
  if (data?.status === "READY") return <Badge variant="success" dot>Ready</Badge>;
  if (data?.status === "FAILED") return <Badge variant="destructive" dot>Failed</Badge>;
  return <Badge variant="highlight" dot>Processing</Badge>;
};

const SubHeader = ({ chat }: { chat: IProps["chat"] }) => (
  <div className="flex h-12 shrink-0 items-center gap-2 border-b px-3 sm:px-4">
    <Button asChild variant="ghost" size="sm" className="-ml-1 px-2 text-muted-foreground">
      <Link href="/documents">
        <ChevronLeftIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Documents</span>
        <span className="sr-only sm:hidden">Back to documents</span>
      </Link>
    </Button>
    <h1 className="min-w-0 flex-1 truncate font-display text-lg font-semibold tracking-tight">
      {chat.name}
    </h1>
    <StatusBadge chatId={chat.id} initial={chat} />
  </div>
);

const Rail = ({ chatId, collapsed, onToggle }: { chatId: string; collapsed: boolean; onToggle: () => void }) => {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Document tools"
      data-tour="doc-nav"
      className={cn(
        "flex shrink-0 flex-col justify-between border-r py-3 transition-[width] duration-200 ease-out",
        collapsed ? "w-14" : "w-44"
      )}
    >
      <ul className="space-y-1 px-2">
        {TOOLS.map((tool) => {
          const href = `/documents/${chatId}/${tool.slug}`;
          const active = pathname === href;
          const Icon = tool.icon;
          const link = (
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex h-9 items-center gap-3 rounded-md px-2.5 font-sans text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-accent/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active && "bg-accent text-foreground",
                // the highlighter bar marks the open tool
                active && "before:absolute before:-left-2 before:top-1.5 before:h-6 before:w-0.5 before:rounded-full before:bg-highlight"
              )}
            >
              <Icon className="h-[1.125rem] w-[1.125rem] shrink-0" />
              {!collapsed && <span className="truncate">{tool.label}</span>}
              {collapsed && <span className="sr-only">{tool.label}</span>}
            </Link>
          );
          return (
            <li key={tool.slug}>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">
                    {tool.label} <span className="ml-1 text-muted-foreground">g {tool.shortcut}</span>
                  </TooltipContent>
                )}
              </Tooltip>
            </li>
          );
        })}
      </ul>
      <div className="px-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn("w-full text-muted-foreground", collapsed ? "justify-center px-0" : "justify-start px-2.5")}
          onClick={onToggle}
          aria-label={collapsed ? "Expand the tool list" : "Collapse the tool list"}
        >
          {collapsed ? <ChevronsRightIcon className="h-4 w-4" /> : <ChevronsLeftIcon className="h-4 w-4" />}
          {!collapsed && <span>Collapse</span>}
        </Button>
      </div>
    </nav>
  );
};

const MobileBar = ({
  chatId,
  chatOpen,
  onToggleChat,
  onNavigate,
}: {
  chatId: string;
  chatOpen: boolean;
  onToggleChat: () => void;
  onNavigate: () => void;
}) => {
  const pathname = usePathname();
  const item = (active: boolean) =>
    cn(
      "relative flex flex-1 flex-col items-center justify-center gap-0.5 font-sans text-[11px] font-medium text-muted-foreground transition-colors duration-150",
      active && "text-foreground",
      active && "before:absolute before:inset-x-3 before:top-0 before:h-0.5 before:rounded-full before:bg-highlight"
    );
  const [first, ...rest] = TOOLS;
  const tool = (t: (typeof TOOLS)[number]) => (
    <Link
      key={t.slug}
      href={`/documents/${chatId}/${t.slug}`}
      onClick={onNavigate}
      aria-current={!chatOpen && pathname === `/documents/${chatId}/${t.slug}` ? "page" : undefined}
      className={item(!chatOpen && pathname === `/documents/${chatId}/${t.slug}`)}
    >
      <t.icon className="h-5 w-5" />
      {t.short}
    </Link>
  );
  return (
    <nav
      aria-label="Document tools"
      data-tour="doc-nav"
      className="fixed inset-x-0 bottom-0 z-40 flex h-14 border-t bg-background/95 backdrop-blur"
    >
      {tool(first)}
      <button type="button" onClick={onToggleChat} aria-pressed={chatOpen} className={item(chatOpen)}>
        <MessageSquareIcon className="h-5 w-5" />
        Chat
      </button>
      {rest.map(tool)}
    </nav>
  );
};

export const WorkspaceShell = ({ chat, chatPanel, children }: IProps) => {
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [collapsed, setCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false); // phones only

  // remember the tool list state between visits (storage can be blocked: then it just resets)
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(RAIL_KEY) === "1");
    } catch {}
  }, []);
  const toggleRail = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem(RAIL_KEY, c ? "0" : "1");
      } catch {}
      return !c;
    });

  const closeChat = useCallback(() => setChatOpen(false), []);

  // keyboard: "/" focuses the chat, "g" then d n s f q switches tool
  useEffect(() => {
    let waiting = false;
    let timer: ReturnType<typeof setTimeout>;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
      const el = e.target as HTMLElement | null;
      if (el?.isContentEditable || el?.closest("input, textarea, select, [role=dialog], [role=alertdialog]")) return;

      if (e.key === "/") {
        e.preventDefault();
        setChatOpen(true);
        // wait a frame so a hidden phone chat is visible before it takes focus
        requestAnimationFrame(() => window.dispatchEvent(new Event("marginalia:focus-chat")));
        return;
      }
      if (waiting) {
        waiting = false;
        clearTimeout(timer);
        const tool = TOOLS.find((t) => t.shortcut === e.key);
        if (tool) {
          setChatOpen(false);
          router.push(`/documents/${chat.id}/${tool.slug}`);
        }
        return;
      }
      if (e.key === "g") {
        waiting = true;
        timer = setTimeout(() => (waiting = false), 1200);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(timer);
    };
  }, [chat.id, router]);

  const body = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0">
        <DocumentStatus chatId={chat.id} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );

  // neutral first paint: the layout depends on the screen size, which the server cannot know
  if (isDesktop === null) {
    return (
      <div className="flex h-[calc(100dvh-4rem-1px)] flex-col" aria-busy="true">
        <div className="h-12 shrink-0 border-b" />
        <div className="flex-1 p-6">
          <Skeleton className="h-full max-h-[70vh] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <WorkspaceProvider value={{ closeChat }}>
      <TooltipProvider>
        <div className="flex h-[calc(100dvh-4rem-1px)] flex-col">
          <SubHeader chat={chat} />
          {isDesktop ? (
            <div className="flex min-h-0 flex-1">
              <Rail chatId={chat.id} collapsed={collapsed} onToggle={toggleRail} />
              <ResizablePanelGroup direction="horizontal" autoSaveId="marginalia-workspace" className="min-w-0 flex-1">
                <ResizablePanel id="main" order={1} defaultSize={62} minSize={35}>
                  {body}
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel id="chat" order={2} defaultSize={38} minSize={26} maxSize={55}>
                  <div className="h-full" data-tour="chat">
                    {chatPanel}
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 pb-14">{body}</div>
              {/* the chat stays mounted while closed, so the conversation is kept */}
              <div
                className={cn("fixed inset-x-0 bottom-14 top-[7.0625rem] z-30 bg-background", !chatOpen && "hidden")}
                data-tour="chat"
              >
                {chatPanel}
              </div>
              <MobileBar
                chatId={chat.id}
                chatOpen={chatOpen}
                onToggleChat={() => setChatOpen((o) => !o)}
                onNavigate={closeChat}
              />
            </>
          )}
        </div>
      </TooltipProvider>
    </WorkspaceProvider>
  );
};
