import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const db = {
  getSettings: vi.fn(),
  getUserKey: vi.fn(),
  countPlatformDocuments: vi.fn(),
  getActionsToday: vi.fn(),
  addAction: vi.fn(),
};
vi.mock("@/services/db/ai", () => ({
  getSettings: (...a: unknown[]) => db.getSettings(...a),
  getUserKey: (...a: unknown[]) => db.getUserKey(...a),
  countPlatformDocuments: (...a: unknown[]) => db.countPlatformDocuments(...a),
  getActionsToday: (...a: unknown[]) => db.getActionsToday(...a),
  addAction: (...a: unknown[]) => db.addAction(...a),
}));
const built: unknown[][] = [];
vi.mock("@/lib/ai/provider", () => ({
  buildChatModel: (...a: unknown[]) => (built.push(["chat", ...a]), { kind: "chat" }),
  buildEmbeddingModel: (...a: unknown[]) => (built.push(["embed", ...a]), { kind: "embed" }),
}));

import {
  assertDocumentAllowance,
  consumeAction,
  defaultSettings,
  getAiForUser,
  platformProvider,
} from "@/lib/ai/credentials";

const env = { ...process.env };
const keys = (map: Record<string, string | null>) => db.getUserKey.mockImplementation(async (_u: string, p: string) => map[p] ?? null);

describe("getAiForUser", () => {
  beforeEach(() => {
    built.length = 0;
    Object.values(db).forEach((m) => m.mockReset());
    db.getSettings.mockResolvedValue(null);
    delete process.env.OPENAI_API_KEY;
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    delete process.env.ALLOW_PLATFORM_KEY;
  });
  afterEach(() => {
    process.env = { ...env };
  });

  it("uses the user's own key first, even when a shared key exists", async () => {
    process.env.OPENAI_API_KEY = "sk-shared-key-1234567890";
    keys({ OPENAI: "sk-user-key-1234567890" });
    const ai = await getAiForUser("u1");
    ai.chat();
    expect(ai.chatSource).toBe("USER");
    expect(built[0]).toEqual(["chat", "OPENAI", "sk-user-key-1234567890", "gpt-4o-mini"]);
  });

  it("falls back to the shared key when the user has none", async () => {
    process.env.OPENAI_API_KEY = "sk-shared-key-1234567890";
    keys({});
    const ai = await getAiForUser("u1");
    ai.embeddings();
    expect(ai.chatSource).toBe("PLATFORM");
    expect(built[0]).toEqual(["embed", "OPENAI", "sk-shared-key-1234567890", "text-embedding-3-small"]);
  });

  it("asks for a key when there is neither", async () => {
    keys({});
    await expect(getAiForUser("u1")).rejects.toMatchObject({ code: "NO_KEY" });
  });

  it("ignores the shared key when the operator switched it off", async () => {
    process.env.OPENAI_API_KEY = "sk-shared-key-1234567890";
    process.env.ALLOW_PLATFORM_KEY = "false";
    keys({});
    expect(platformProvider()).toBeNull();
    await expect(getAiForUser("u1")).rejects.toMatchObject({ code: "NO_KEY" });
  });

  it("defaults to Google when only a Google shared key exists", async () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "AIzaSyShared1234567890123456";
    expect(defaultSettings()).toMatchObject({ chatProvider: "GOOGLE", chatModel: "gemini-2.5-flash", embedModel: "gemini-embedding-001" });
  });

  it("only needs the half it is asked for", async () => {
    db.getSettings.mockResolvedValue({ chatProvider: "GOOGLE", chatModel: "gemini-2.5-flash", embedProvider: "OPENAI", embedModel: "text-embedding-3-small" });
    keys({ GOOGLE: "AIzaUserKey12345678901234" }); // no OpenAI key
    const ai = await getAiForUser("u1", { need: "chat" });
    expect(() => ai.embeddings()).toThrow();
    ai.chat();
    await expect(getAiForUser("u1", { need: "embed" })).rejects.toMatchObject({ code: "NO_KEY" });
    await expect(getAiForUser("u1")).rejects.toMatchObject({ code: "NO_KEY" });
  });

  it("follows the user's settings and their key for that provider", async () => {
    db.getSettings.mockResolvedValue({ chatProvider: "GOOGLE", chatModel: "gemini-2.5-pro", embedProvider: "GOOGLE", embedModel: "gemini-embedding-001" });
    keys({ GOOGLE: "AIzaUserKey12345678901234" });
    const ai = await getAiForUser("u1");
    ai.chat();
    expect(built[0]).toEqual(["chat", "GOOGLE", "AIzaUserKey12345678901234", "gemini-2.5-pro"]);
  });

  it("embeds questions with the model that built the document, and needs that provider's key", async () => {
    db.getSettings.mockResolvedValue({ chatProvider: "GOOGLE", chatModel: "gemini-2.5-flash", embedProvider: "GOOGLE", embedModel: "gemini-embedding-001" });
    keys({ GOOGLE: "AIzaUserKey12345678901234" }); // no OpenAI key
    const err = await getAiForUser("u1", { document: { embedProvider: "OPENAI", embedModel: "text-embedding-3-small" } }).catch((e) => e);
    expect(err.code).toBe("NO_KEY");
    expect(err.message).toMatch(/OpenAI embeddings/);
    keys({ GOOGLE: "AIzaUserKey12345678901234", OPENAI: "sk-user-key-1234567890" });
    const ai = await getAiForUser("u1", { document: { embedProvider: "OPENAI", embedModel: "text-embedding-3-small" } });
    ai.embeddings();
    expect(built.at(-1)).toEqual(["embed", "OPENAI", "sk-user-key-1234567890", "text-embedding-3-small"]);
  });
});

describe("the shared allowance", () => {
  const platformAi = { chatSource: "PLATFORM", embedSource: "PLATFORM" } as never;
  const userAi = { chatSource: "USER", embedSource: "USER" } as never;
  beforeEach(() => {
    Object.values(db).forEach((m) => m.mockReset());
    delete process.env.PLATFORM_FREE_DOCUMENTS;
    delete process.env.PLATFORM_FREE_ACTIONS_PER_DAY;
  });
  afterEach(() => {
    process.env = { ...env };
  });

  it("is unlimited when no limit is set (self-hosting)", async () => {
    await expect(assertDocumentAllowance("u", platformAi)).resolves.toBeUndefined();
    await expect(consumeAction("u", platformAi)).resolves.toBeUndefined();
    expect(db.countPlatformDocuments).not.toHaveBeenCalled();
  });

  it("blocks the document after the free documents are used", async () => {
    process.env.PLATFORM_FREE_DOCUMENTS = "3";
    db.countPlatformDocuments.mockResolvedValue(2);
    await expect(assertDocumentAllowance("u", platformAi)).resolves.toBeUndefined();
    db.countPlatformDocuments.mockResolvedValue(3);
    await expect(assertDocumentAllowance("u", platformAi)).rejects.toMatchObject({ code: "PLATFORM_LIMIT" });
  });

  it("never limits someone using their own key", async () => {
    process.env.PLATFORM_FREE_DOCUMENTS = "1";
    process.env.PLATFORM_FREE_ACTIONS_PER_DAY = "1";
    await expect(assertDocumentAllowance("u", userAi)).resolves.toBeUndefined();
    await expect(consumeAction("u", userAi)).resolves.toBeUndefined();
    expect(db.addAction).not.toHaveBeenCalled();
  });

  it("counts daily actions and stops once the limit is passed", async () => {
    process.env.PLATFORM_FREE_ACTIONS_PER_DAY = "2";
    db.addAction.mockResolvedValueOnce(1).mockResolvedValueOnce(2).mockResolvedValueOnce(3);
    await consumeAction("u", platformAi);
    await consumeAction("u", platformAi);
    await expect(consumeAction("u", platformAi)).rejects.toMatchObject({ code: "PLATFORM_LIMIT" });
  });
});
