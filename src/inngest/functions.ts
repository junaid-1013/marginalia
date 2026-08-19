import { NonRetriableError } from "inngest";

import { inngest } from "@/inngest/client";
import {
  EMBED_BATCH_SIZE,
  countChunks,
  getChunks,
  indexChunkBatch,
  ingestChunks,
} from "@/lib/ai/pipeline";
import { mapReduce } from "@/lib/ai/map-reduce";
import { flashcardsConfig, summaryConfig } from "@/lib/ai/prompts";
import { db } from "@/lib/db";
import {
  saveFlashcards,
  saveSummary,
  updateChatStatus,
} from "@/services/db/chat";

const errorMessage = (e: unknown) =>
  (e instanceof Error ? e.message : "Unknown error").slice(0, 500);

const loadChat = async (chatId: string) => {
  const chat = await db.chat.findUnique({
    where: { id: chatId },
    select: { id: true, pdfLink: true },
  });
  // no point retrying a chat that was deleted meanwhile
  if (!chat) throw new NonRetriableError("Chat not found");
  return chat;
};

/** Parse -> chunks in db -> embeddings in pgvector -> fan out summary + flashcards. */
export const processDocument = inngest.createFunction(
  {
    id: "process-document",
    retries: 2,
    concurrency: { limit: 1, key: "event.data.chatId" },
    onFailure: async ({ event, error }) => {
      await updateChatStatus(event.data.event.data.chatId, {
        status: "FAILED",
        processingError: errorMessage(error),
      }).catch(() => {});
    },
  },
  { event: "document/uploaded" },
  async ({ event, step }) => {
    const { chatId } = event.data;
    const chat = await step.run("load-chat", () => loadChat(chatId));

    await step.run("mark-processing", () =>
      updateChatStatus(chatId, { status: "PROCESSING", processingError: null })
    );

    const chunkCount = await step.run("ingest", () => ingestChunks(chat));

    for (let offset = 0; offset < chunkCount; offset += EMBED_BATCH_SIZE) {
      await step.run(`index-${offset}`, () =>
        indexChunkBatch({ chatId, offset })
      );
    }

    await step.run("mark-ready", () =>
      updateChatStatus(chatId, {
        status: "READY",
        processingError: null,
        summaryStatus: "PENDING",
        flashcardsStatus: "PENDING",
      })
    );

    await step.sendEvent("fan-out", [
      { name: "document/summarize", data: { chatId } },
      { name: "document/flashcards", data: { chatId } },
    ]);
    return { chunkCount };
  }
);

/** Chunks normally exist already. Documents from before the pipeline do not. */
const chunkTexts = async (chat: { id: string; pdfLink: string }) => {
  if ((await countChunks(chat.id)) === 0) await ingestChunks(chat);
  return (await getChunks(chat.id)).map((c) => c.content);
};

export const generateSummary = inngest.createFunction(
  {
    id: "generate-summary",
    retries: 2,
    concurrency: { limit: 1, key: "event.data.chatId" },
    onFailure: async ({ event }) => {
      await updateChatStatus(event.data.event.data.chatId, {
        summaryStatus: "FAILED",
      }).catch(() => {});
    },
  },
  { event: "document/summarize" },
  async ({ event, step }) => {
    const { chatId } = event.data;
    const chat = await step.run("load-chat", () => loadChat(chatId));
    await step.run("mark-processing", () =>
      updateChatStatus(chatId, { summaryStatus: "PROCESSING" })
    );

    const chunks = await step.run("chunks", async () => {
      await chunkTexts(chat);
      return (await countChunks(chatId)) as number;
    });
    // read outside of step outputs to keep them small
    const texts = (await getChunks(chatId)).map((c) => c.content);
    if (chunks === 0 || texts.length === 0) {
      throw new NonRetriableError("No text to summarize");
    }

    const summary = await mapReduce({ step, chunks: texts, config: summaryConfig });
    await step.run("save", async () => {
      await saveSummary({ chatId, summary });
      await updateChatStatus(chatId, { summaryStatus: "READY" });
    });
  }
);

export const generateFlashcards = inngest.createFunction(
  {
    id: "generate-flashcards",
    retries: 2,
    concurrency: { limit: 1, key: "event.data.chatId" },
    onFailure: async ({ event }) => {
      await updateChatStatus(event.data.event.data.chatId, {
        flashcardsStatus: "FAILED",
      }).catch(() => {});
    },
  },
  { event: "document/flashcards" },
  async ({ event, step }) => {
    const { chatId } = event.data;
    const chat = await step.run("load-chat", () => loadChat(chatId));
    await step.run("mark-processing", () =>
      updateChatStatus(chatId, { flashcardsStatus: "PROCESSING" })
    );

    const chunks = await step.run("chunks", async () => {
      await chunkTexts(chat);
      return (await countChunks(chatId)) as number;
    });
    const texts = (await getChunks(chatId)).map((c) => c.content);
    if (chunks === 0 || texts.length === 0) {
      throw new NonRetriableError("No text to make flashcards from");
    }

    const { flashcards } = await mapReduce({
      step,
      chunks: texts,
      config: flashcardsConfig,
    });
    await step.run("save", async () => {
      await saveFlashcards({ chatId, flashcards });
      await updateChatStatus(chatId, { flashcardsStatus: "READY" });
    });
  }
);

export const functions = [processDocument, generateSummary, generateFlashcards];
