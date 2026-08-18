import { z } from "zod";

import {
  errorResponse,
  parseBody,
  parseQuery,
  requireOwnedChat,
} from "@/lib/api-guard";
import { saveChatNote } from "@/services/db/chat";

const bodySchema = z.object({
  chatId: z.string().min(1),
  block: z.string().min(1).max(500_000),
});
// reads the query string, never prerender
export const dynamic = "force-dynamic";

const querySchema = z.object({ chatId: z.string().min(1) });

export async function POST(req: Request) {
  try {
    const { chatId, block } = await parseBody(req, bodySchema);
    const { chat } = await requireOwnedChat(chatId);
    const note = await saveChatNote({ chatId: chat.id, note: block });
    return Response.json(note, { status: 200 });
  } catch (e) {
    return errorResponse(e, "Failed to save note");
  }
}

export async function GET(req: Request) {
  try {
    const { chatId } = parseQuery(req, querySchema);
    const { chat } = await requireOwnedChat(chatId);
    return Response.json(chat.note, { status: 200 });
  } catch (e) {
    return errorResponse(e, "Failed to get note");
  }
}
