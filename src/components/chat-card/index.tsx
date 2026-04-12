"use client";

import React from "react";
import { useChat } from "ai/react";
import { SendIcon } from "lucide-react";
import { type Chat } from "@prisma/client";
import Balancer from "react-wrap-balancer";

import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { saveCompletionMessage, getChatMessages } from "@/apis";
import { Message } from "ai";

type Props = {
  chat: Chat | null;
};

const ChatCard = ({ chat }: Props) => {
  const { data: listMessages } = useQuery({
    queryKey: ["list-messages-from-chat"],
    queryFn: () => getChatMessages({ chatId: chat?.id as string }),
  });
  const { mutateAsync: saveMessage } = useMutation({
    mutationFn: saveCompletionMessage,
    onSuccess: () => {
      console.log("Chat saved");
    },
    onError: (e) => {
      console.error("Failed to save chat messages", e);
    },
  });

  const { messages, handleInputChange, handleSubmit, input } = useChat({
    api: "/api/chat",
    sendExtraMessageFields: true,
    body: {
      collectionName: chat?.collectionName,
      chatId: chat?.id,
    },
    initialMessages: listMessages,

    onFinish: (dd) => {
      if (chat) {
        saveMessage({
          chatId: chat?.id,
          message: dd,
        });
      }
    },
  });
  console.log("listMessages", listMessages);
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
