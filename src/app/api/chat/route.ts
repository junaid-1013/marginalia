import { z } from "zod";

import { streamAnswer } from "@/lib/ai/chat";
import {
  ApiError,
  errorResponse,
  limitUser,
  parseBody,
  requireOwnedChat,
} from "@/lib/api-guard";

const bodySchema = z.object({
  chatId: z.string().min(1),
  messages: z
    .array(
      z
        .object({
          // never accept "system" from the client: only the server sets the prompt
          role: z.enum(["user", "assistant"]),
          content: z.string().max(8000),
        })
        .passthrough()
    )
    .min(1)
    .max(100),
});

export async function POST(req: Request) {
  try {
    const { chatId, messages } = await parseBody(req, bodySchema);
    if (messages[messages.length - 1].role !== "user") {
      throw new ApiError(400, "The last message must come from the user");
    }
    const { userId, chat } = await requireOwnedChat(chatId);
    limitUser(userId, "chat", 20);

    if (chat.status !== "READY") {
      return Response.json(
        { error: "Document is not ready yet" },
        { status: 409 }
      );
    }

    return await streamAnswer({
      chatId: chat.id,
      messages: messages.map(({ role, content }) => ({ role, content })),
    });
  } catch (e) {
    return errorResponse(e, "Failed to answer");
  }
}
