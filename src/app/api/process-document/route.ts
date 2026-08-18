import { z } from "zod";

import {
  errorResponse,
  limitUser,
  parseBody,
  requireOwnedChat,
} from "@/lib/api-guard";
import { inngest } from "@/inngest/client";
import { updateChatStatus } from "@/services/db/chat";

const bodySchema = z.object({ chatId: z.string().min(1) });

/** Re-runs the whole pipeline for a chat (retry after a failure). */
export async function POST(req: Request) {
  try {
    const { chatId } = await parseBody(req, bodySchema);
    const { userId, chat } = await requireOwnedChat(chatId);
    limitUser(userId, "process-document", 5);

    if (chat.status === "PROCESSING") {
      return Response.json({ error: "Already processing" }, { status: 409 });
    }

    await updateChatStatus(chat.id, {
      status: "PENDING",
      summaryStatus: "IDLE",
      flashcardsStatus: "IDLE",
      processingError: null,
    });
    await inngest.send({ name: "document/uploaded", data: { chatId: chat.id } });
    return Response.json({ status: "PENDING" }, { status: 202 });
  } catch (e) {
    return errorResponse(e, "Failed to start processing");
  }
}
