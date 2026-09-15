import type { EmbeddingModel, LanguageModel } from "ai";

import { AiKeyError, noKeyError, platformLimitError } from "@/lib/ai/errors";
import { buildChatModel, buildEmbeddingModel } from "@/lib/ai/provider";
import { PROVIDERS, type ProviderId } from "@/lib/ai/providers";
import {
  addAction,
  countPlatformDocuments,
  getActionsToday,
  getSettings,
  getUserKey,
} from "@/services/db/ai";

/**
 * Whose key pays for an AI call.
 *   1. the user's own key for that provider,
 *   2. otherwise the shared key from the environment (if the operator enabled it), within its allowance,
 *   3. otherwise nothing: the person is asked to add a key.
 * Self-hosters just set OPENAI_API_KEY and leave the limits at 0 (unlimited).
 */

export type KeySource = "USER" | "PLATFORM";

const platformKeys = (): Record<ProviderId, string | undefined> => ({
  OPENAI: process.env.OPENAI_API_KEY || undefined,
  GOOGLE: process.env.GOOGLE_GENERATIVE_AI_API_KEY || undefined,
});

/** The operator can switch the shared key off without removing it. */
export const platformEnabled = () => process.env.ALLOW_PLATFORM_KEY !== "false";

export const platformAvailableFor = (provider: ProviderId) => platformEnabled() && !!platformKeys()[provider];

/** The provider the shared key belongs to: the default for people who have not chosen one. */
export const platformProvider = (): ProviderId | null =>
  platformEnabled() ? (platformKeys().OPENAI ? "OPENAI" : platformKeys().GOOGLE ? "GOOGLE" : null) : null;

// 0 means no limit
const limit = (name: string) => Math.max(0, Number(process.env[name]) || 0);
export const freeDocumentLimit = () => limit("PLATFORM_FREE_DOCUMENTS");
export const freeActionLimit = () => limit("PLATFORM_FREE_ACTIONS_PER_DAY");

export interface IAiSettings {
  chatProvider: ProviderId;
  chatModel: string;
  embedProvider: ProviderId;
  embedModel: string;
}

export const defaultSettings = (): IAiSettings => {
  const provider = platformProvider() ?? "OPENAI";
  const info = PROVIDERS[provider];
  return {
    chatProvider: provider,
    // the env overrides only describe the shared key's models
    chatModel: (platformProvider() && process.env.AI_CHAT_MODEL) || info.defaultChat,
    embedProvider: provider,
    embedModel: (platformProvider() && process.env.AI_EMBED_MODEL) || info.defaultEmbed,
  };
};

export const getEffectiveSettings = async (userId: string): Promise<IAiSettings> => {
  const saved = await getSettings(userId);
  return saved
    ? {
        chatProvider: saved.chatProvider,
        chatModel: saved.chatModel,
        embedProvider: saved.embedProvider,
        embedModel: saved.embedModel,
      }
    : defaultSettings();
};

const pickKey = async (userId: string, provider: ProviderId): Promise<{ key: string; source: KeySource } | null> => {
  const own = await getUserKey(userId, provider);
  if (own) return { key: own, source: "USER" };
  const shared = platformAvailableFor(provider) ? platformKeys()[provider] : undefined;
  return shared ? { key: shared, source: "PLATFORM" } : null;
};

export interface IAiContext {
  chatSource: KeySource;
  embedSource: KeySource;
  chatProvider: ProviderId;
  chatModelId: string;
  embedProvider: ProviderId;
  embedModelId: string;
  chat: () => LanguageModel;
  embeddings: () => EmbeddingModel<string>;
}

export type AiNeed = "chat" | "embed" | "both";

/**
 * The models to use for one user. Say what you need: summaries only need the chat key, indexing only the
 * embedding key, so a missing key for the other half is not an error.
 * `document` is a document that was already embedded: its questions must use the very model that built
 * its vectors, which can differ from the user's current choice.
 */
export const getAiForUser = async (
  userId: string,
  opts: {
    need?: AiNeed;
    document?: { embedProvider?: ProviderId | null; embedModel?: string | null };
  } = {}
): Promise<IAiContext> => {
  const { need = "both", document } = opts;
  const settings = await getEffectiveSettings(userId);

  const embedProvider = document?.embedProvider ?? settings.embedProvider;
  const embedModelId =
    document?.embedProvider != null
      ? document.embedModel || PROVIDERS[embedProvider].defaultEmbed
      : settings.embedModel;

  const [chat, embed] = await Promise.all([
    need === "embed" ? null : pickKey(userId, settings.chatProvider),
    need === "chat" ? null : pickKey(userId, embedProvider),
  ]);

  if (need !== "embed" && !chat) throw noKeyError();
  if (need !== "chat" && !embed) {
    throw document?.embedProvider
      ? new AiKeyError(
          "NO_KEY",
          `This document was indexed with ${PROVIDERS[embedProvider].label} embeddings. Add a ${PROVIDERS[embedProvider].label} key, or re-index the document with your current provider.`
        )
      : noKeyError();
  }

  return {
    chatSource: chat?.source ?? "USER",
    embedSource: embed?.source ?? "USER",
    chatProvider: settings.chatProvider,
    chatModelId: settings.chatModel,
    embedProvider,
    embedModelId,
    chat: () => {
      if (!chat) throw new Error("The chat model was not requested");
      return buildChatModel(settings.chatProvider, chat.key, settings.chatModel);
    },
    embeddings: () => {
      if (!embed) throw new Error("The embedding model was not requested");
      return buildEmbeddingModel(embedProvider, embed.key, embedModelId);
    },
  };
};

/** Stops a new document that would push the user past the shared key's free documents. */
export const assertDocumentAllowance = async (userId: string, ai: IAiContext, exceptChatId?: string) => {
  const max = freeDocumentLimit();
  if (ai.embedSource !== "PLATFORM" || max === 0) return;
  if ((await countPlatformDocuments(userId, exceptChatId)) >= max) {
    throw platformLimitError(`You have used the ${max} free documents.`);
  }
};

/** Counts one chat message or regeneration against today's shared allowance, when the shared key pays. */
export const consumeAction = async (userId: string, ai: IAiContext) => {
  const max = freeActionLimit();
  if (max === 0 || (ai.chatSource !== "PLATFORM" && ai.embedSource !== "PLATFORM")) return;
  // increment first, then compare: two requests at once cannot both slip under the limit
  if ((await addAction(userId)) > max) throw platformLimitError("You have used today's free AI actions.");
};

/** What the settings screen shows about the shared allowance. */
export const describePlatform = async (userId: string) => {
  const provider = platformProvider();
  if (!provider) return { available: false as const };
  const docs = freeDocumentLimit();
  const actions = freeActionLimit();
  return {
    available: true as const,
    provider,
    freeDocumentsLeft: docs ? Math.max(0, docs - (await countPlatformDocuments(userId))) : null,
    freeActionsLeftToday: actions ? Math.max(0, actions - (await getActionsToday(userId))) : null,
  };
};

/** Can this user start processing a new document right now? The answer the UI and init-chat both use. */
export const processingReadiness = async (userId: string) => {
  try {
    const ai = await getAiForUser(userId, { need: "embed" });
    await assertDocumentAllowance(userId, ai);
    return { ok: true as const };
  } catch (e) {
    if (e instanceof AiKeyError) return { ok: false as const, code: e.code, message: e.message };
    throw e;
  }
};
