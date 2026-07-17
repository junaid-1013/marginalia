import { z } from "zod";

import { summarizeDocument } from "@/actions/process-pdf";
import {
  errorResponse,
  limitUser,
  parseBody,
  requireOwnedChat,
} from "@/lib/api-guard";
import { saveSummary } from "@/services/db/chat";

const bodySchema = z.object({ chatId: z.string().min(1) });

export async function POST(req: Request) {
  try {
    const { chatId } = await parseBody(req, bodySchema);
    const { userId, chat } = await requireOwnedChat(chatId);
    limitUser(userId, "summarize", 5);

    const summary = await summarizeDocument(chat);
    await saveSummary({ chatId: chat.id, summary });
    return Response.json(summary, { status: 200 });
  } catch (e) {
    return errorResponse(e, "Failed to summarize");
  }
}
