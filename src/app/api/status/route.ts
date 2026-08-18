import { z } from "zod";

import {
  errorResponse,
  parseQuery,
  requireOwnedChat,
} from "@/lib/api-guard";
import { getChatStatus } from "@/services/db/chat";

// reads the query string, never prerender
export const dynamic = "force-dynamic";

const querySchema = z.object({ chatId: z.string().min(1) });

export async function GET(req: Request) {
  try {
    const { chatId } = parseQuery(req, querySchema);
    const { chat } = await requireOwnedChat(chatId);
    return Response.json(await getChatStatus(chat.id), {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return errorResponse(e, "Failed to get status");
  }
}
