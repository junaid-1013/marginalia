import { z } from "zod";

import {
  errorResponse,
  parseQuery,
  requireOwnedChat,
} from "@/lib/api-guard";
import { getChatSummary } from "@/services/db/chat";

const querySchema = z.object({ chatId: z.string().min(1) });

export async function GET(req: Request) {
  try {
    const { chatId } = parseQuery(req, querySchema);
    const { chat } = await requireOwnedChat(chatId);
    const summary = await getChatSummary(chat.id);
    return Response.json(summary, { status: 200 });
  } catch (e) {
    return errorResponse(e, "Failed to get summary");
  }
}
