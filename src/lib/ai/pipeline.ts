import { OpenAIEmbeddings } from "@langchain/openai";
import { WebPDFLoader } from "langchain/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { db } from "@/lib/db";

export const CHUNK_SIZE = 1000;
export const CHUNK_OVERLAP = 100;
// protects the OpenAI bill: ~800k characters, a few hundred pages
export const MAX_CHUNKS = 800;
export const EMBED_BATCH_SIZE = 100;

export const downloadPdf = async (pdfLink: string) => {
  try {
    const response = await fetch(pdfLink);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status}`);
    }
    return await response.blob();
  } catch (error) {
    console.error("Error downloading PDF:", error);
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

  const docs = await new WebPDFLoader(blob).load();
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });
  const split = await splitter.splitDocuments(docs);

  const rows = split
    .map((doc) => ({
      // postgres text columns cannot contain NUL bytes
      content: doc.pageContent.replace(/\u0000/g, "").trim(),
      page: (doc.metadata?.loc?.pageNumber as number | undefined) ?? null,
    }))
    .filter((row) => row.content.length > 0)
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
export const toVectorLiteral = (vector: number[]) => `[${vector.join(",")}]`;

/**
 * Embeds `EMBED_BATCH_SIZE` chunks starting at `offset` and stores the vectors.
 * Idempotent: a retried batch simply overwrites its own rows.
 */
export const indexChunkBatch = async ({
  chatId,
  offset,
}: {
  chatId: string;
  offset: number;
}) => {
  const chunks = await db.chunk.findMany({
    where: { chatId, index: { gte: offset, lt: offset + EMBED_BATCH_SIZE } },
    orderBy: { index: "asc" },
    select: { id: true, content: true },
  });
  if (chunks.length === 0) return 0;

  const vectors = await new OpenAIEmbeddings().embedDocuments(
    chunks.map((c) => c.content)
  );
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
