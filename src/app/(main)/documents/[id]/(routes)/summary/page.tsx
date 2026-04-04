"use client";

import {
  InboxIcon as EmptyBoxIcon,
  LoaderIcon,
  SparkleIcon,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useParams } from "next/navigation";

import { useMutation } from "@tanstack/react-query";
import { summarize } from "@/apis";
import { Button } from "@/components/ui/button";
import Balancer from "react-wrap-balancer";

const DocumentSummaryPage = () => {
  const { id } = useParams();
  const { mutate, data, isPending } = useMutation({
    mutationFn: summarize,
    onSuccess: (data) => {
      console.log("data", data);
    },
    onError: (error) => {
      console.error("error", error);
    },
  });
  console.log("data", data);
  return (
    <>
      <main className="container py-4">
        <div className="flex justify-between pt-6">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Summary
          </h2>
          <Button
            onClick={() => mutate({ chatId: id as string })}
            disabled={isPending}
          >
            {isPending && <LoaderIcon className="w-5 h-5 animate-spin mr-2" />}
            Summarize
          </Button>
          {/* <Link
            href="/documents/create"
            className={cn(buttonVariants({ variant: "default" }), "space-x-2")}
          >
            <PlusCircleIcon className="w-4 h-4" />
            <span>Add document</span>
          </Link> */}
        </div>
        <div className="flex flex-wrap gap-5 my-10 relative">
          {!data && (
            <div className="absolte top-1/2 left-1/2 flex flex-col items-center justify-center w-full h-96">
              <EmptyBoxIcon className="w-24 h-24 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">No summary found</p>
            </div>
          )}
          {data && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Introduction</AccordionTrigger>
                <AccordionContent>
                  <Balancer>{data.introduction}</Balancer>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Abstract</AccordionTrigger>
                <AccordionContent>
                  <Balancer>{data.abstract}</Balancer>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Key Takeaways</AccordionTrigger>
                <AccordionContent>
                  {/* this is the array of the stings so show them in the ul */}
                  <ul className="list-inside space-y-2">
                    {data.keyTakeaways.map((takeaway: string) => (
                      <li key={takeaway} className="flex">
                        <SparkleIcon className="w-4 h-4 text-accent mr-4 inline-block stroke-foreground/90 shrink-0" />
                        <span className="opacity-90">{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                {/* tldr */}
                <AccordionTrigger>TL;DR</AccordionTrigger>
                <AccordionContent>
                  <p>{data.tldr}</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </main>
    </>
  );
};

export default DocumentSummaryPage;
