import { NonRetriableError } from "inngest";

import { assertDocumentAllowance, getAiForUser, type IAiContext } from "@/lib/ai/credentials";
import { classifyAiError, isKeyProblem } from "@/lib/ai/errors";
import { redactSecrets } from "@/lib/crypto";
import { db } from "@/lib/db";
import type { ProviderId } from "@/lib/ai/providers";

// A key problem cannot be fixed by retrying, so it fails the job straight away. The code travels in the
// error message (that is all an Inngest failure handler receives) and is parsed back by describeFailure.
const PREFIX = "AI_KEY:";

export const toJobError = (e: unknown, source: "user" | "platform", model?: string): Error => {
  const known = classifyAiError(e, source, model);
  if (isKeyProblem(known.code)) return new NonRetriableError(`${PREFIX}${known.code}:${known.message}`);
  // transient problems: let Inngest retry the original error
  return e instanceof Error ? e : known;
};

/** The failure as it should be stored and shown: a code the UI can act on, and a message without secrets. */
export const describeFailure = (error: unknown): { code: string | null; message: string } => {
  const raw = error instanceof Error ? error.message : String(error ?? "Unknown error");
  const match = raw.match(/AI_KEY:([A-Z_]+):([\s\S]*)$/);
  if (match) return { code: match[1], message: match[2].trim() };
  return { code: null, message: redactSecrets(raw).slice(0, 500) };
};

export const sourceOf = (ai: IAiContext, half: "chat" | "embed") =>
  (half === "chat" ? ai.chatSource : ai.embedSource) === "PLATFORM" ? ("platform" as const) : ("user" as const);

/** Who the document belongs to, and which embedding model built its vectors (if any yet). */
export const loadOwner = async (chatId: string) => {
  const chat = await db.chat.findUnique({
    where: { id: chatId },
    select: { userId: true, embedProvider: true, embedModel: true },
  });
  if (!chat) throw new NonRetriableError("Chat not found");
  return chat as { userId: string; embedProvider: ProviderId | null; embedModel: string | null };
};

/** The chat model of the document's owner, or a non-retryable key error. */
export const chatAiFor = async (chatId: string) => {
  const { userId } = await loadOwner(chatId);
  try {
    return await getAiForUser(userId, { need: "chat" });
  } catch (e) {
    throw toJobError(e, "user");
  }
};

/** Picks the models for indexing a new document and records which embedding model builds its vectors. */
export const resolveForIndexing = async (chatId: string) => {
  const { userId } = await loadOwner(chatId);
  try {
    const ai = await getAiForUser(userId, { need: "embed" });
    await assertDocumentAllowance(userId, ai, chatId);
    await db.chat.update({
      where: { id: chatId },
      data: {
        aiSource: ai.embedSource,
        embedProvider: ai.embedProvider,
        embedModel: ai.embedModelId,
        errorCode: null,
      },
    });
  } catch (e) {
    throw toJobError(e, "user");
  }
};

/** The embedding model the document's vectors were (or are being) built with. */
export const embedderForDocument = async (chatId: string) => {
  const owner = await loadOwner(chatId);
  try {
    const ai = await getAiForUser(owner.userId, {
      need: "embed",
      document: { embedProvider: owner.embedProvider, embedModel: owner.embedModel },
    });
    return { ai, embedder: ai.embeddings() };
  } catch (e) {
    throw toJobError(e, "user");
  }
};
