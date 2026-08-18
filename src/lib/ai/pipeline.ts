import { createHash } from "crypto";
import { OpenAIEmbeddings } from "@langchain/openai";
import { WebPDFLoader } from "langchain/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { db } from "@/lib/db";
import { downloadPdf, getQDrantClient } from "@/actions/process-pdf";

export const CHUNK_SIZE = 1000;
export const CHUNK_OVERLAP = 100;
// protects the OpenAI bill: ~800k characters, a few hundred pages
export const MAX_CHUNKS = 800;
export const EMBED_BATCH_SIZE = 100;

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

/** Drops and recreates the (old) vector collection so re-processing is clean. */
export const resetCollection = async (collectionName: string) => {
  const client = getQDrantClient();
  try {
    await client.deleteCollection(collectionName);
  } catch {
    // did not exist yet (or the store is down: createCollection reports that)
  }
  try {
    await client.createCollection(collectionName, {
      vectors: { size: 1536, distance: "Cosine" },
    });
  } catch (e) {
    throw new Error(
      `Vector store unavailable (${e instanceof Error ? e.message : "unknown"})`
    );
  }
};

// qdrant point ids must be uint or uuid. Deriving it from chat + index makes
// a retried batch overwrite its own points instead of duplicating them.
const pointId = (chatId: string, index: number) => {
  const h = createHash("sha1").update(`${chatId}:${index}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(
    16,
    20
  )}-${h.slice(20, 32)}`;
};

/** Embeds `EMBED_BATCH_SIZE` chunks starting at `offset` and upserts them. */
export const indexChunkBatch = async ({
  chatId,
  collectionName,
  offset,
}: {
  chatId: string;
  collectionName: string;
  offset: number;
}) => {
  const chunks = await db.chunk.findMany({
    where: { chatId, index: { gte: offset, lt: offset + EMBED_BATCH_SIZE } },
    orderBy: { index: "asc" },
  });
  if (chunks.length === 0) return 0;

  const vectors = await new OpenAIEmbeddings().embedDocuments(
    chunks.map((c) => c.content)
  );
  // same payload shape the langchain Qdrant retriever reads in the chat route
  await getQDrantClient().upsert(collectionName, {
    wait: true,
    points: chunks.map((chunk, i) => ({
      id: pointId(chatId, chunk.index),
      vector: vectors[i],
      payload: {
        content: chunk.content,
        metadata: { page: chunk.page, index: chunk.index },
      },
    })),
  });
  return chunks.length;
};
