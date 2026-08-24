import { del } from "@vercel/blob";

import { errorResponse, requireOwnedChat } from "@/lib/api-guard";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

/** Deletes a document: the stored PDF and, through cascades, everything derived from it. */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { chat } = await requireOwnedChat(params.id);

    // chunks, embeddings, messages, summary, flashcards and quiz go with the chat (onDelete: Cascade)
    await db.chat.delete({ where: { id: chat.id } });

    // best effort: a leftover blob is only wasted space, the document is already gone
    try {
      await del(chat.pdfLink);
    } catch (e) {
      logger.warn("blob delete failed", { chatId: chat.id, error: String(e) });
    }
    return new Response(null, { status: 204 });
  } catch (e) {
    return errorResponse(e, "Failed to delete the document");
  }
}
