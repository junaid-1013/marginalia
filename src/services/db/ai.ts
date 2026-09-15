import type { AiProvider } from "@prisma/client";

import { decryptSecret, encryptSecret, lastFour } from "@/lib/crypto";
import { db } from "@/lib/db";

// Everything about a user's AI settings and keys. Plaintext keys only ever leave this file through
// getUserKey(), which the AI resolver calls to build a model for a single request or job step.

export interface IPublicKey {
  provider: AiProvider;
  last4: string;
  validatedAt: string | null;
}

export interface IPublicAiSettings {
  chatProvider: AiProvider;
  chatModel: string;
  embedProvider: AiProvider;
  embedModel: string;
  keys: IPublicKey[];
}

export const getSettings = (userId: string) => db.aiSettings.findUnique({ where: { userId } });

export const saveSettings = (
  userId: string,
  data: { chatProvider: AiProvider; chatModel: string; embedProvider: AiProvider; embedModel: string }
) =>
  db.aiSettings.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });

/** Encrypts and stores a key, replacing any key the user already had for that provider. */
export const saveKey = async (userId: string, provider: AiProvider, apiKey: string, validated: boolean) => {
  const key = apiKey.trim();
  // the user id is bound into the ciphertext
  const { cipher, keyVersion } = encryptSecret(key, userId);
  return db.aiKey.upsert({
    where: { userId_provider: { userId, provider } },
    create: { userId, provider, cipher, keyVersion, last4: lastFour(key), validatedAt: validated ? new Date() : null },
    update: { cipher, keyVersion, last4: lastFour(key), validatedAt: validated ? new Date() : null },
  });
};

export const deleteKey = (userId: string, provider: AiProvider) =>
  db.aiKey.deleteMany({ where: { userId, provider } });

/** The plaintext key, or null if the user has none for this provider. Never return this to a client. */
export const getUserKey = async (userId: string, provider: AiProvider) => {
  const row = await db.aiKey.findUnique({ where: { userId_provider: { userId, provider } } });
  return row ? decryptSecret(row.cipher, userId) : null;
};

/** Everything the settings screen may know: no ciphertext, no key. */
export const getPublicState = async (userId: string) => {
  const [settings, keys] = await Promise.all([
    getSettings(userId),
    db.aiKey.findMany({ where: { userId }, select: { provider: true, last4: true, validatedAt: true } }),
  ]);
  return {
    settings: settings
      ? {
          chatProvider: settings.chatProvider,
          chatModel: settings.chatModel,
          embedProvider: settings.embedProvider,
          embedModel: settings.embedModel,
        }
      : null,
    keys: keys.map((k) => ({ provider: k.provider, last4: k.last4, validatedAt: k.validatedAt?.toISOString() ?? null })),
  };
};

// ---- the shared (platform) allowance ---------------------------------------

const today = () => new Date(new Date().toISOString().slice(0, 10)); // UTC day

export const countPlatformDocuments = (userId: string, exceptChatId?: string) =>
  db.chat.count({ where: { userId, aiSource: "PLATFORM", ...(exceptChatId ? { id: { not: exceptChatId } } : {}) } });

export const getActionsToday = async (userId: string) =>
  (await db.aiUsage.findUnique({ where: { userId_day: { userId, day: today() } } }))?.actions ?? 0;

/** Counts one chat message or regeneration against today's allowance and returns the new total. */
export const addAction = async (userId: string) =>
  (
    await db.aiUsage.upsert({
      where: { userId_day: { userId, day: today() } },
      create: { userId, day: today(), actions: 1 },
      update: { actions: { increment: 1 } },
    })
  ).actions;
