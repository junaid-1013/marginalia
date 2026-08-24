"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useChat } from "ai/react";
import { SendIcon } from "lucide-react";
import { type Chat } from "@prisma/client";
import Balancer from "react-wrap-balancer";

import { cn } from "@/lib/utils";
import { useDocumentStatus } from "@/hooks/use-document-status";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { type Message } from "ai";

/** Pages the answer was based on (sent by the server as a message annotation). Click to open them. */
const Sources = ({
  annotations,
  chatId,
}: {
  annotations?: unknown[];
  chatId: string;
}) => {
  const router = useRouter();
  const sources = (annotations as { sources?: { page: number | null }[] }[] | undefined)
    ?.find((a) => a?.sources)?.sources;
  const pages = Array.from(
    new Set((sources ?? []).map((s) => s.page).filter((p): p is number => !!p))
  ).sort((a, b) => a - b);
  if (pages.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
      <span>Sources:</span>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => router.push(`/documents/${chatId}/view?page=${p}`)}
          className="rounded border px-1.5 py-0.5 hover:bg-primary/10 hover:text-foreground"
        >
          p. {p}
        </button>
      ))}
    </div>
  );
};

type Props = {
  chat: Chat | null;
  initialMessages?: Message[];
};

const ChatCard = ({ chat, initialMessages }: Props) => {
  const { isReady } = useDocumentStatus(chat?.id ?? "", chat ? {
    status: chat.status,
    summaryStatus: chat.summaryStatus,
    flashcardsStatus: chat.flashcardsStatus,
    quizStatus: chat.quizStatus,
    processingError: chat.processingError,
  } : undefined);
  const { messages, handleInputChange, handleSubmit, input, error, status } = useChat({
    api: "/api/chat",
    // the server saves both sides of the conversation itself
    body: {
      chatId: chat?.id,
    },
    initialMessages,
  });
  return (
    <Card className="h-full relative flex flex-col border-none pt-6">
      <CardContent className="flex-1 h-full overflow-y-auto">
        <div className="space-y-4">
          {messages &&
            messages.map((message, i) => (
              <div
                key={i}
                className={cn(
                  "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm overflow-hidden",
                  message.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <Balancer>{message.content}</Balancer>
                {message.role === "assistant" && (
                  <Sources annotations={message.annotations} chatId={chat?.id ?? ""} />
                )}
              </div>
            ))}
          {status === "submitted" && (
            <p className="text-xs text-muted-foreground">Thinking...</p>
          )}
          {error && (
            <p className="text-xs text-destructive">
              Something went wrong. Please try again.
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="sticky bottom-0 bg-background/75 backdrop-blur-md py-5">
        <form
          onSubmit={handleSubmit}
          className="flex w-full items-center justify-between space-x-2"
        >
          <Input
            id="message"
            placeholder={isReady ? "Type your message..." : "Available once processing finishes"}
            disabled={!isReady}
            wrapperClassName="flex-grow"
            value={input}
            onChange={handleInputChange}
          />
          <Button type="submit" size="icon" disabled={!input || !isReady}>
            <SendIcon className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatCard;
