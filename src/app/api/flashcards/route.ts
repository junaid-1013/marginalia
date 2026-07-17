import { z } from "zod";

import { createFlashcards } from "@/actions/process-pdf";
import {
  errorResponse,
  limitUser,
  parseBody,
  parseQuery,
  requireOwnedChat,
} from "@/lib/api-guard";
import { getChatFlashcards, saveFlashcards } from "@/services/db/chat";

const bodySchema = z.object({ chatId: z.string().min(1) });
const querySchema = z.object({ chatId: z.string().min(1) });

export async function POST(req: Request) {
  try {
    const { chatId } = await parseBody(req, bodySchema);
    const { userId, chat } = await requireOwnedChat(chatId);
    limitUser(userId, "flashcards", 5);

    const { flashcards } = await createFlashcards(chat);
    await saveFlashcards({ chatId: chat.id, flashcards });
    return Response.json(flashcards, { status: 200 });
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
