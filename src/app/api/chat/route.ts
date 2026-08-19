import { z } from "zod";
import { StreamingTextResponse } from "ai";

import { streamAnswer } from "@/lib/ai/chat";
import {
  errorResponse,
  limitUser,
  parseBody,
  requireOwnedChat,
} from "@/lib/api-guard";

const bodySchema = z.object({
  chatId: z.string().min(1),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().max(8000),
      }).passthrough()
    )
    .min(1)
    .max(100),
});

export async function POST(req: Request) {
  try {
    const { chatId, messages } = await parseBody(req, bodySchema);
    const { userId, chat } = await requireOwnedChat(chatId);
    limitUser(userId, "chat", 20);

    if (chat.status !== "READY") {
      return Response.json(
        { error: "Document is not ready yet" },
        { status: 409 }
      );
    }

    const stream = await streamAnswer({
      messages: messages as any,
      chatId: chat.id,
    });
    return new StreamingTextResponse(stream);
  } catch (e) {
    return errorResponse(e, "Failed to answer");
  }
}
