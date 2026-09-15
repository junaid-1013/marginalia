import type { EmbeddingModel } from "ai";

import { db } from "@/lib/db";
import { embedQuery, toVectorLiteral } from "@/lib/ai/pipeline";

export interface IRetrievedChunk {
  id: string;
  content: string;
  page: number | null;
  score: number;
}

/**
 * The k chunks of ONE document closest to the query (cosine similarity).
 * Always scoped by chatId, so a document can never leak into another chat.
 */
export const searchChunks = async ({
  chatId,
  query,
  k = 4,
  embedder,
}: {
  chatId: string;
  query: string;
  k?: number;
  /** must be the model that built this document's vectors */
  embedder: EmbeddingModel<string>;
}): Promise<IRetrievedChunk[]> => {
  const vector = toVectorLiteral(await embedQuery(query, embedder));
  return db.$queryRaw<IRetrievedChunk[]>`
    SELECT "id", "content", "page",
           1 - ("embedding" <=> ${vector}::vector) AS "score"
    FROM "Chunk"
    WHERE "chatId" = ${chatId} AND "embedding" IS NOT NULL
    ORDER BY "embedding" <=> ${vector}::vector
    LIMIT ${k}`;
};

export const formatChunksAsContext = (chunks: IRetrievedChunk[]) =>
  chunks
    .map((c) => (c.page ? `[page ${c.page}]\n${c.content}` : c.content))
    .join("\n\n");
