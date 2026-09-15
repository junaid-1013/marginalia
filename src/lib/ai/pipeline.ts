import { embed, embedMany, type EmbeddingModel } from "ai";

import { db } from "@/lib/db";
import { errorFields, logger } from "@/lib/logger";
import { extractPdfPages } from "@/lib/ai/pdf";
import { splitText } from "@/lib/ai/split-text";
import { openPdf } from "@/lib/storage";

export const CHUNK_SIZE = 1000;
export const CHUNK_OVERLAP = 100;
// protects the OpenAI bill: ~800k characters, a few hundred pages
export const MAX_CHUNKS = 800;
export const EMBED_BATCH_SIZE = 100;

export const downloadPdf = async (pdfLink: string) => {
  try {
    const pdf = await openPdf(pdfLink);
    if (!pdf) throw new Error("PDF not found in storage");
    return await new Response(pdf.stream).blob();
  } catch (error) {
    logger.error("pdf download failed", errorFields(error));
    return null;
  }
};

/**
 * Downloads the PDF, splits it and stores the chunks. This is the only place
 * the PDF is parsed: indexing, summary and flashcards all read the chunks.
 * Returns the number of chunks.
 */
export const ingestChunks = async (chat: { id: string; pdfLink: string }) => {
  const blob = await downloadPdf(chat.pdfLink);
  if (!blob) throw new Error("Could not download the PDF");

  const pages = await extractPdfPages(await blob.arrayBuffer());

  // split page by page so every chunk keeps the page it came from
  const rows = pages
    .flatMap(({ page, text }) =>
      splitText(
        // postgres text columns cannot contain NUL bytes
        text.replace(/\u0000/g, ""),
        CHUNK_SIZE,
        CHUNK_OVERLAP
      ).map((content) => ({ content, page }))
    )
    .map((row, index) => ({ ...row, index, chatId: chat.id }));

  if (rows.length === 0) {
    throw new Error(
      "No text found in this PDF. Scanned (image only) PDFs are not supported yet."
    );
  }
  if (rows.length > MAX_CHUNKS) {
    throw new Error("This PDF is too large to process.");
  }

  await db.$transaction([
    db.chunk.deleteMany({ where: { chatId: chat.id } }),
    db.chunk.createMany({ data: rows }),
  ]);
  return rows.length;
};

export const countChunks = (chatId: string) =>
  db.chunk.count({ where: { chatId } });

export const getChunks = (chatId: string) =>
  db.chunk.findMany({ where: { chatId }, orderBy: { index: "asc" } });

/** pgvector text format: '[0.1,0.2,...]' */
export const embedQuery = async (text: string, model: EmbeddingModel<string>) =>
  (await embed({ model, value: text })).embedding;

export const toVectorLiteral = (vector: number[]) => `[${vector.join(",")}]`;

/**
 * Embeds `EMBED_BATCH_SIZE` chunks starting at `offset` and stores the vectors.
 * Idempotent: a retried batch simply overwrites its own rows.
 */
export const indexChunkBatch = async ({
  chatId,
  offset,
  embedder,
}: {
  chatId: string;
  offset: number;
  embedder: EmbeddingModel<string>;
}) => {
  const chunks = await db.chunk.findMany({
    where: { chatId, index: { gte: offset, lt: offset + EMBED_BATCH_SIZE } },
    orderBy: { index: "asc" },
    select: { id: true, content: true },
  });
  if (chunks.length === 0) return 0;

  const { embeddings: vectors } = await embedMany({
    model: embedder,
    values: chunks.map((c) => c.content),
  });
  const ids = chunks.map((c) => c.id);
  const literals = vectors.map(toVectorLiteral);

  await db.$executeRaw`
    UPDATE "Chunk" AS c
    SET "embedding" = v.embedding::vector
    FROM (
      SELECT unnest(${ids}::text[]) AS id, unnest(${literals}::text[]) AS embedding
    ) AS v
    WHERE c."id" = v.id`;
  return chunks.length;
};
