import { NonRetriableError } from "inngest";

import { inngest } from "@/inngest/client";
import {
  chatAiFor,
  describeFailure,
  embedderForDocument,
  resolveForIndexing,
  sourceOf,
  toJobError,
} from "@/inngest/ai-guard";
import {
  EMBED_BATCH_SIZE,
  countChunks,
  getChunks,
  indexChunkBatch,
  ingestChunks,
} from "@/lib/ai/pipeline";
import { mapReduce } from "@/lib/ai/map-reduce";
import {
  MAX_WORDS,
  QUIZ_QUESTIONS,
  flashcardsConfig,
  quizConfig,
  summaryConfig,
} from "@/lib/ai/prompts";
import { db } from "@/lib/db";
import {
  saveFlashcards,
  saveQuiz,
  saveSummary,
  updateChatStatus,
} from "@/services/db/chat";

// what is stored for a failed job: a message without secrets, and a code when the cause is a key problem
const failureData = (e: unknown) => {
  const { code, message } = describeFailure(e);
  return { processingError: message, ...(code ? { errorCode: code } : {}) };
};

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
        ...failureData(error),
      }).catch(() => {});
    },
  },
  { event: "document/uploaded" },
  async ({ event, step }) => {
    const { chatId } = event.data;
    const chat = await step.run("load-chat", () => loadChat(chatId));

    await step.run("mark-processing", () =>
      updateChatStatus(chatId, { status: "PROCESSING", processingError: null, errorCode: null })
    );
    // fail fast, before parsing anything: no key, a rejected key or a used-up allowance stops here
    await step.run("resolve-ai", () => resolveForIndexing(chatId));

    const chunkCount = await step.run("ingest", () => ingestChunks(chat));

    for (let offset = 0; offset < chunkCount; offset += EMBED_BATCH_SIZE) {
      await step.run(`index-${offset}`, async () => {
        const { ai, embedder } = await embedderForDocument(chatId);
        try {
          return await indexChunkBatch({ chatId, offset, embedder });
        } catch (e) {
          throw toJobError(e, sourceOf(ai, "embed"), ai.embedModelId);
        }
      });
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
    onFailure: async ({ event, error }) => {
      await updateChatStatus(event.data.event.data.chatId, {
        summaryStatus: "FAILED",
        ...(describeFailure(error).code ? { errorCode: describeFailure(error).code } : {}),
      }).catch(() => {});
    },
  },
  { event: "document/summarize" },
  async ({ event, step }) => {
    const { chatId } = event.data;
    const chat = await step.run("load-chat", () => loadChat(chatId));
    await step.run("mark-processing", () =>
      updateChatStatus(chatId, { summaryStatus: "PROCESSING", errorCode: null })
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

    const ai = await chatAiFor(chatId);
    const summary = await mapReduce({
      step,
      chunks: texts,
      config: summaryConfig,
      model: ai.chat(),
      classify: (e) => toJobError(e, sourceOf(ai, "chat"), ai.chatModelId),
    });
    await step.run("save", async () => {
      await saveSummary({
        chatId,
        summary: {
          ...summary,
          mostUsedWords: summary.mostUsedWords.slice(0, MAX_WORDS),
        },
      });
      await updateChatStatus(chatId, { summaryStatus: "READY" });
    });
  }
);

export const generateFlashcards = inngest.createFunction(
  {
    id: "generate-flashcards",
    retries: 2,
    concurrency: { limit: 1, key: "event.data.chatId" },
    onFailure: async ({ event, error }) => {
      await updateChatStatus(event.data.event.data.chatId, {
        flashcardsStatus: "FAILED",
        ...(describeFailure(error).code ? { errorCode: describeFailure(error).code } : {}),
      }).catch(() => {});
    },
  },
  { event: "document/flashcards" },
  async ({ event, step }) => {
    const { chatId } = event.data;
    const chat = await step.run("load-chat", () => loadChat(chatId));
    await step.run("mark-processing", () =>
      updateChatStatus(chatId, { flashcardsStatus: "PROCESSING", errorCode: null })
    );

    const chunks = await step.run("chunks", async () => {
      await chunkTexts(chat);
      return (await countChunks(chatId)) as number;
    });
    const texts = (await getChunks(chatId)).map((c) => c.content);
    if (chunks === 0 || texts.length === 0) {
      throw new NonRetriableError("No text to make flashcards from");
    }

    const ai = await chatAiFor(chatId);
    const { flashcards } = await mapReduce({
      step,
      chunks: texts,
      config: flashcardsConfig,
      model: ai.chat(),
      classify: (e) => toJobError(e, sourceOf(ai, "chat"), ai.chatModelId),
    });
    await step.run("save", async () => {
      await saveFlashcards({ chatId, flashcards });
      await updateChatStatus(chatId, { flashcardsStatus: "READY" });
    });
  }
);

const shuffle = <T,>(items: T[]) => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const generateQuiz = inngest.createFunction(
  {
    id: "generate-quiz",
    retries: 2,
    concurrency: { limit: 1, key: "event.data.chatId" },
    onFailure: async ({ event, error }) => {
      await updateChatStatus(event.data.event.data.chatId, {
        quizStatus: "FAILED",
        ...(describeFailure(error).code ? { errorCode: describeFailure(error).code } : {}),
      }).catch(() => {});
    },
  },
  { event: "document/quiz" },
  async ({ event, step }) => {
    const { chatId } = event.data;
    const chat = await step.run("load-chat", () => loadChat(chatId));
    await step.run("mark-processing", () =>
      updateChatStatus(chatId, { quizStatus: "PROCESSING", errorCode: null })
    );

    const chunks = await step.run("chunks", async () => {
      await chunkTexts(chat);
      return (await countChunks(chatId)) as number;
    });
    const texts = (await getChunks(chatId)).map((c) => c.content);
    if (chunks === 0 || texts.length === 0) {
      throw new NonRetriableError("No text to make a quiz from");
    }

    const ai = await chatAiFor(chatId);
    const { questions } = await mapReduce({
      step,
      chunks: texts,
      config: quizConfig,
      model: ai.chat(),
      classify: (e) => toJobError(e, sourceOf(ai, "chat"), ai.chatModelId),
    });

    await step.run("save", async () => {
      // models often put the right answer first: shuffle, and drop malformed questions
      const valid = questions
        .filter(
          (q) =>
            q.options.length === 4 &&
            Number.isInteger(q.answerIndex) &&
            q.answerIndex >= 0 &&
            q.answerIndex < 4
        )
        .slice(0, QUIZ_QUESTIONS)
        .map((q) => {
          const correct = q.options[q.answerIndex];
          const options = shuffle(q.options);
          return { ...q, options, answerIndex: options.indexOf(correct) };
        });
      if (valid.length === 0) throw new Error("The model returned no usable questions");
      await saveQuiz({ chatId, questions: valid });
      await updateChatStatus(chatId, { quizStatus: "READY" });
    });
  }
);

export const functions = [
  processDocument,
  generateSummary,
  generateFlashcards,
  generateQuiz,
];
