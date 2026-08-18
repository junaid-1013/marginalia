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

/** Queues (re)generation of the summary. Progress is read from /api/status. */
export async function POST(req: Request) {
  try {
    const { chatId } = await parseBody(req, bodySchema);
    const { userId, chat } = await requireOwnedChat(chatId);
    limitUser(userId, "summarize", 5);

    if (chat.status !== "READY") {
      return Response.json({ error: "Document is not ready yet" }, { status: 409 });
    }
    if (chat.summaryStatus === "PENDING" || chat.summaryStatus === "PROCESSING") {
      return Response.json({ error: "Already generating" }, { status: 409 });
    }

    await updateChatStatus(chat.id, { summaryStatus: "PENDING" });
    await inngest.send({ name: "document/summarize", data: { chatId: chat.id } });
    return Response.json({ status: "PENDING" }, { status: 202 });
  } catch (e) {
    return errorResponse(e, "Failed to start summary");
  }
}
