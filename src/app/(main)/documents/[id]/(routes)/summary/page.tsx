"use client";

import {
  InboxIcon as EmptyBoxIcon,
  LoaderIcon,
  SparkleIcon,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Balancer from "react-wrap-balancer";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { summarize } from "@/apis";
import { Button } from "@/components/ui/button";
import { getChatSummary } from "@/apis/summary";
import WordCloud from "@/components/word-cloud";
import { Separator } from "@/components/ui/separator";
import { useDocumentStatus } from "@/hooks/use-document-status";

const DocumentSummaryPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data: status, summaryRunning, isReady } = useDocumentStatus(id as string);

  const { mutate, isPending } = useMutation({
    mutationFn: summarize,
    // generation runs in the background, start polling the status
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["status", id] }),
    onError: (error) => {
      console.error("error", error);
    },
  });

  const { data: summary } = useQuery({
    queryKey: ["summary-associated-with-Chat", id],
    queryFn: getChatSummary,
  });

  // load the summary as soon as the background job reports it is done
  useEffect(() => {
    if (status?.summaryStatus === "READY") {
      queryClient.invalidateQueries({
        queryKey: ["summary-associated-with-Chat", id],
      });
    }
  }, [status?.summaryStatus, id, queryClient]);

  return (
    <>
      <main className="container py-4">
        <div className="sticky top-0 left-0 bg-background/80 backdrop-blur-sm z-20">
          <div className="flex justify-between py-6">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Summary
            </h2>
            {/* if summary not available, so generate */}
            {!summary && (
              <Button
                onClick={() => mutate({ chatId: id as string })}
                disabled={isPending || summaryRunning || !isReady}
              >
                {(isPending || summaryRunning) && (
                  <LoaderIcon className="w-5 h-5 animate-spin mr-2" />
                )}
                Summarize
              </Button>
            )}
          </div>
          <Separator />
        </div>
        <div className="flex flex-wrap gap-5 my-10 relative">
          {!summary && (
            <div className="absolte top-1/2 left-1/2 flex flex-col items-center justify-center w-full h-96">
              <EmptyBoxIcon className="w-24 h-24 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                {summaryRunning
                  ? "Generating your summary..."
                  : status?.summaryStatus === "FAILED"
                  ? "Summary failed. Try again."
                  : "No summary found"}
              </p>
            </div>
          )}

          {summary && (
            <>
              <div className="mx-auto w-full flex flex-col justify-center items-center space-y-1">
                <WordCloud words={summary.mostUsedWords} />
                <p className="text-xs text-primary/80">Words Count</p>
              </div>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Introduction</AccordionTrigger>
                  <AccordionContent>
                    <Balancer className="text-lg">
                      {summary.introduction}
                    </Balancer>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Abstract</AccordionTrigger>
                  <AccordionContent>
                    <Balancer className="text-lg">{summary.abstract}</Balancer>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Key Takeaways</AccordionTrigger>
                  <AccordionContent>
                    {/* this is the array of the stings so show them in the ul */}
                    <ul className="list-inside space-y-2">
                      {summary.keyTakeaways?.map((takeaway: string) => (
                        <li key={takeaway} className="flex">
                          <SparkleIcon className="w-4 h-4 text-accent mr-4 inline-block stroke-foreground/90 shrink-0" />
                          <span className="opacity-90 text-lg">{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  {/* tldr */}
                  <AccordionTrigger>TL;DR</AccordionTrigger>
                  <AccordionContent>
                    <Balancer className="text-lg">{summary.tldr}</Balancer>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default DocumentSummaryPage;
