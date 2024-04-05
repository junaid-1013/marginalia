"use client";

import React from "react";
import { useChat } from "ai/react";
import { SendIcon } from "lucide-react";
import { type Chat } from "@prisma/client";

import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";

type Props = {
  chat: Chat | null;
};

const ChatCard = ({ chat }: Props) => {
  const { messages, handleInputChange, handleSubmit, input } = useChat({
    api: "/api/chat",
    sendExtraMessageFields: true,
    body: {
      collectionName: chat?.collectionName,
    },
  });

  return (
    <Card className="h-full relative flex flex-col">
      <CardContent className="flex-1">
        <div className="space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={cn(
                "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm overflow-hidden",
                message.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {message.content}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="sticky bottom-0 bg-background/75 backdrop-blur-md py-5">
        <form
          onSubmit={handleSubmit}
          className="flex w-full items-center justify-between space-x-2"
        >
          <Input
            id="message"
            placeholder="Type your message..."
            wrapperClassName="flex-grow"
            value={input}
            onChange={handleInputChange}
          />
          <Button type="submit" size="icon" disabled={!input}>
            <SendIcon className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatCard;
