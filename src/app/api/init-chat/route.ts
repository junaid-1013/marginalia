import { z } from "zod";

import {
  errorResponse,
  limitUser,
  parseBody,
  requireUserId,
} from "@/lib/api-guard";
import { errorFields, logger } from "@/lib/logger";
import { MAX_DOCUMENTS_PER_USER } from "@/constants";
import { db } from "@/lib/db";
import { isTrustedPdfUrl } from "@/lib/storage";
import { inngest } from "@/inngest/client";
import { initializeChat, updateChatStatus } from "@/services/db/chat";

const bodySchema = z.object({
  name: z.string().trim().min(2).max(100),
  pdfLink: z.string().url(),
  pdfStoragePath: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    limitUser(userId, "init-chat", 10);
    const { name, pdfLink, pdfStoragePath } = await parseBody(req, bodySchema);

    if ((await db.chat.count({ where: { userId } })) >= MAX_DOCUMENTS_PER_USER) {
      return Response.json(
        {
          error: `Document limit reached (${MAX_DOCUMENTS_PER_USER}). Delete one first.`,
        },
        { status: 403 }
      );
    }

    // the file must live in this user's blob namespace
    if (!pdfStoragePath.startsWith(`${userId}/`)) {
      return Response.json({ error: "Invalid file" }, { status: 400 });
    }
    // and the link must be that very blob, not some other address the server would fetch
    if (!isTrustedPdfUrl(pdfLink, pdfStoragePath)) {
      return Response.json({ error: "Invalid file" }, { status: 400 });
    }

    const chat = await initializeChat({
      name,
      userId,
      pdfLink,
      pdfStoragePath,
    });

    // everything after the upload (parse, index, summary, flashcards) runs in
    // the background. If the queue is unreachable the chat is marked failed so
    // the user can retry instead of waiting forever.
    try {
      await inngest.send({ name: "document/uploaded", data: { chatId: chat.id } });
    } catch (e) {
      logger.error("failed to queue document processing", { chatId: chat.id, ...errorFields(e) });
      const failed = await updateChatStatus(chat.id, {
        status: "FAILED",
        processingError: "Could not queue processing. Please retry.",
      });
      return Response.json({ chat: failed }, { status: 201 });
    }
    return Response.json({ chat }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("You already have")) {
      return Response.json({ error: e.message }, { status: 409 });
    }
    return errorResponse(e, "Failed to initialize chat");
  }
}
