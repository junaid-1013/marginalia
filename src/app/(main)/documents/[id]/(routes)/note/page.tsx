"use client";

import { useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { type Block, type PartialBlock } from "@blocknote/core";
import { useQuery } from "@tanstack/react-query";

import { NoteGET, NotePOST } from "@/apis/note";
import Editor from "@/components/editor";
import { ToolPage } from "@/components/study/tool-page";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAutosave, type AutosaveState } from "@/hooks/use-autosave";

const STATUS_TEXT: Record<AutosaveState, string> = {
  idle: "Saved automatically",
  unsaved: "Unsaved changes",
  saving: "Saving",
  saved: "Saved",
  error: "Could not save",
};

const DocumentNotePage = () => {
  const { id } = useParams();
  const chatId = id as string;

  const { data: saved, isLoading } = useQuery({
    queryKey: ["note", id],
    queryFn: NoteGET,
    // the editor owns the text once it is open: never refetch over it
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const initialContent = useMemo(() => {
    if (!saved) return undefined;
    try {
      return JSON.parse(saved) as PartialBlock[];
    } catch {
      return undefined;
    }
  }, [saved]);

  const { state, schedule, retry } = useAutosave({
    save: async (value) => {
      await NotePOST({ chatId, block: value });
    },
    // closing the tab: a keepalive request outlives the page
    onLeave: useCallback(
      (value: string) => {
        fetch("/api/note", {
          method: "POST",
          keepalive: true,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId, block: value }),
        });
      },
      [chatId]
    ),
  });

  return (
    <ToolPage className="max-w-4xl">
      <PageHeader
        title="Notes"
        description="Your own notes on this document."
        actions={
          <span
            className={`flex items-center gap-2 text-caption ${state === "error" ? "text-destructive" : ""}`}
            aria-live="polite"
          >
            {STATUS_TEXT[state]}
            {state === "error" && (
              <Button size="sm" variant="outline" onClick={() => retry()}>
                Retry
              </Button>
            )}
          </span>
        }
      />
      {isLoading ? (
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      ) : (
        <div className="notes-editor rounded-lg border bg-card py-3">
          <Editor
            key={chatId}
            initialContent={initialContent}
            onChange={(blocks: Block[]) => schedule(JSON.stringify(blocks))}
          />
        </div>
      )}
    </ToolPage>
  );
};

export default DocumentNotePage;
