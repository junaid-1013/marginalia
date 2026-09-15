import { z } from "zod";

import { inngest } from "@/inngest/client";
import { consumeAction, getAiForUser } from "@/lib/ai/credentials";
import {
  errorResponse,
  limitUser,
  parseBody,
  parseQuery,
  requireOwnedChat,
} from "@/lib/api-guard";
import { getChatFlashcards, updateChatStatus } from "@/services/db/chat";

const bodySchema = z.object({ chatId: z.string().min(1) });
// reads the query string, never prerender
export const dynamic = "force-dynamic";

const querySchema = z.object({ chatId: z.string().min(1) });

/** Queues (re)generation of the flashcards. Progress is read from /api/status. */
export async function POST(req: Request) {
  try {
    const { chatId } = await parseBody(req, bodySchema);
    const { userId, chat } = await requireOwnedChat(chatId);
    limitUser(userId, "flashcards", 5);

    if (chat.status !== "READY") {
      return Response.json({ error: "Document is not ready yet" }, { status: 409 });
    }
    if (
      chat.flashcardsStatus === "PENDING" ||
      chat.flashcardsStatus === "PROCESSING"
    ) {
      return Response.json({ error: "Already generating" }, { status: 409 });
    }

    // a manual (re)generation spends AI: resolve whose key pays, and count it against the shared allowance
    await consumeAction(userId, await getAiForUser(userId, { need: "chat" }));

    await updateChatStatus(chat.id, { flashcardsStatus: "PENDING" });
    await inngest.send({ name: "document/flashcards", data: { chatId: chat.id } });
    return Response.json({ status: "PENDING" }, { status: 202 });
  } catch (e) {
    return errorResponse(e, "Failed to create flashcards");
  }
}

export async function GET(req: Request) {
  try {
    const { chatId } = parseQuery(req, querySchema);
    const { chat } = await requireOwnedChat(chatId);
    const flashcards = await getChatFlashcards(chat.id);
    return Response.json(flashcards, { status: 200 });
  } catch (e) {
    return errorResponse(e, "Failed to get flashcards");
  }
}
