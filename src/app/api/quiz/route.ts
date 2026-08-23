import { z } from "zod";

import {
  errorResponse,
  limitUser,
  parseBody,
  parseQuery,
  requireOwnedChat,
} from "@/lib/api-guard";
import { inngest } from "@/inngest/client";
import { getChatQuiz, updateChatStatus } from "@/services/db/chat";

// reads the query string, never prerender
export const dynamic = "force-dynamic";

const bodySchema = z.object({ chatId: z.string().min(1) });
const querySchema = z.object({ chatId: z.string().min(1) });

/** Queues (re)generation of the quiz. Progress is read from /api/status. */
export async function POST(req: Request) {
  try {
    const { chatId } = await parseBody(req, bodySchema);
    const { userId, chat } = await requireOwnedChat(chatId);
    limitUser(userId, "quiz", 5);

    if (chat.status !== "READY") {
      return Response.json({ error: "Document is not ready yet" }, { status: 409 });
    }
    if (chat.quizStatus === "PENDING" || chat.quizStatus === "PROCESSING") {
      return Response.json({ error: "Already generating" }, { status: 409 });
    }

    await updateChatStatus(chat.id, { quizStatus: "PENDING" });
    await inngest.send({ name: "document/quiz", data: { chatId: chat.id } });
    return Response.json({ status: "PENDING" }, { status: 202 });
  } catch (e) {
    return errorResponse(e, "Failed to start quiz");
  }
}

export async function GET(req: Request) {
  try {
    const { chatId } = parseQuery(req, querySchema);
    const { chat } = await requireOwnedChat(chatId);
    return Response.json(await getChatQuiz(chat.id), { status: 200 });
  } catch (e) {
    return errorResponse(e, "Failed to get quiz");
  }
}
