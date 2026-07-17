import { z } from "zod";

import { loadPdfIntoVectorStore } from "@/actions/process-pdf";
import {
  errorResponse,
  limitUser,
  parseBody,
  requireOwnedChat,
} from "@/lib/api-guard";

const bodySchema = z.object({ chatId: z.string().min(1) });

export async function POST(req: Request) {
  try {
    const { chatId } = await parseBody(req, bodySchema);
    const { userId, chat } = await requireOwnedChat(chatId);
    limitUser(userId, "process-document", 5);

    // link and collection come from the database, never from the client
    const collection = await loadPdfIntoVectorStore({
      pdfLink: chat.pdfLink,
      collectionName: chat.collectionName,
    });
    return Response.json({ collection }, { status: 201 });
  } catch (e) {
    return errorResponse(e, "Failed to process document");
  }
}
