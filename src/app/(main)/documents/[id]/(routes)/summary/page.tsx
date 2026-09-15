"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { CopyIcon, RefreshCwIcon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { reportAiError } from "@/lib/client-errors";

import { summarize } from "@/apis";
import { getChatSummary } from "@/apis/summary";
import { StudyGate } from "@/components/study/study-gate";
import { ToolPage } from "@/components/study/tool-page";
import WordCloud from "@/components/study/word-cloud";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { useDocumentStatus } from "@/hooks/use-document-status";

const DocumentSummaryPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data: status, summaryRunning, isReady } = useDocumentStatus(id as string);

  const { mutate, isPending } = useMutation({
    mutationFn: summarize,
    // generation runs in the background, start polling the status
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["status", id] }),
    onError: (e) => reportAiError(e, "The summary could not be started. Try again."),
  });

  const { data: summary, isLoading } = useQuery({
    queryKey: ["summary-associated-with-Chat", id],
    queryFn: getChatSummary,
  });

  // load the summary as soon as the background job reports it is done
  useEffect(() => {
    if (status?.summaryStatus === "READY") {
      queryClient.invalidateQueries({ queryKey: ["summary-associated-with-Chat", id] });
    }
  }, [status?.summaryStatus, id, queryClient]);

  const generate = () => mutate({ chatId: id as string });

  const copy = async () => {
    if (!summary) return;
    const text = [
      summary.tldr,
      "",
      "Key takeaways",
      ...summary.keyTakeaways.map((t: string) => `- ${t}`),
      "",
      "Introduction",
      summary.introduction,
      "",
      "Abstract",
      summary.abstract,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Summary copied.");
    } catch {
      toast.error("Could not copy. Select the text and copy it manually.");
    }
  };

  return (
    <ToolPage>
      <PageHeader
        title="Summary"
        description="The document in short, with the points worth remembering."
        actions={
          summary && (
            <>
              <Button variant="outline" size="sm" onClick={copy}>
                <CopyIcon className="h-4 w-4" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={generate}
                disabled={isPending || summaryRunning || !isReady}
              >
                <RefreshCwIcon className="h-4 w-4" />
                Regenerate
              </Button>
            </>
          )
        }
      />
      <StudyGate
        noun="summary"
        pitch="A short summary, the key takeaways and the most used words, written from the whole document."
        generateLabel="Generate summary"
        loading={isLoading}
        hasContent={!!summary}
        documentReady={isReady}
        running={summaryRunning}
        failed={status?.summaryStatus === "FAILED"}
        errorCode={status?.errorCode}
        starting={isPending}
        onGenerate={generate}
      >
        {summary && (
          <article className="space-y-10">
            <section className="space-y-2">
              <p className="text-caption">In short</p>
              <p className="font-display text-2xl leading-9 text-balance">
                <span className="mark-hl">{summary.tldr}</span>
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-heading">Key takeaways</h2>
              <ul className="space-y-3">
                {summary.keyTakeaways?.map((takeaway: string) => (
                  <li key={takeaway} className="text-reading border-l-2 border-margin/50 pl-4">
                    {takeaway}
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-heading">Introduction</h2>
              <p className="text-reading text-ink-soft">{summary.introduction}</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-heading">Abstract</h2>
              <p className="text-reading text-ink-soft">{summary.abstract}</p>
            </section>

            {summary.mostUsedWords?.length > 0 && (
              <section className="space-y-3 border-t pt-8">
                <h2 className="text-heading">Most used words</h2>
                <WordCloud words={summary.mostUsedWords} />
              </section>
            )}
          </article>
        )}
      </StudyGate>
    </ToolPage>
  );
};

export default DocumentSummaryPage;
