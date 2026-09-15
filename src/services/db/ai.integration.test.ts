// Needs the database: bun run test:db
import { randomBytes } from "crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { db } from "@/lib/db";
import {
  addAction,
  countPlatformDocuments,
  deleteKey,
  getActionsToday,
  getPublicState,
  getUserKey,
  saveKey,
} from "@/services/db/ai";

const run = process.env.RUN_DB_TESTS ? describe : describe.skip;

run("ai keys (database)", () => {
  let alice: string, bob: string;
  const KEY = "sk-live-0123456789abcdefghij";

  beforeAll(async () => {
    process.env.KEY_ENCRYPTION_SECRET = randomBytes(32).toString("base64");
    const mk = (email: string) => db.user.upsert({ where: { email }, update: {}, create: { email, name: email } });
    alice = (await mk("ai-alice@test.local")).id;
    bob = (await mk("ai-bob@test.local")).id;
  });
  afterAll(async () => {
    await db.chat.deleteMany({ where: { userId: { in: [alice, bob] } } });
    await db.user.deleteMany({ where: { id: { in: [alice, bob] } } });
    await db.$disconnect();
  });

  it("stores only ciphertext and returns the key to its owner", async () => {
    await saveKey(alice, "OPENAI", ` ${KEY} `, true);
    const row = await db.aiKey.findUnique({ where: { userId_provider: { userId: alice, provider: "OPENAI" } } });
    expect(row?.cipher).not.toContain("0123456789");
    expect(row?.last4).toBe("ghij");
    expect(await getUserKey(alice, "OPENAI")).toBe(KEY);
  });

  it("never exposes a key through the public state", async () => {
    const state = JSON.stringify(await getPublicState(alice));
    expect(state).not.toContain(KEY);
    expect(state).not.toContain("cipher");
    expect(state).toContain("ghij");
  });

  it("does not hand one user's key to another", async () => {
    expect(await getUserKey(bob, "OPENAI")).toBeNull();
  });

  it("refuses a ciphertext copied onto another user's row", async () => {
    const stolen = await db.aiKey.findUniqueOrThrow({ where: { userId_provider: { userId: alice, provider: "OPENAI" } } });
    await db.aiKey.create({ data: { userId: bob, provider: "OPENAI", cipher: stolen.cipher, last4: stolen.last4, keyVersion: stolen.keyVersion } });
    await expect(getUserKey(bob, "OPENAI")).rejects.toThrow(); // bound to alice's id
    await deleteKey(bob, "OPENAI");
  });

  it("replaces a key for the same provider and removes it on request", async () => {
    await saveKey(alice, "OPENAI", "sk-new-0123456789abcdefgh99", true);
    expect(await getUserKey(alice, "OPENAI")).toBe("sk-new-0123456789abcdefgh99");
    expect(await db.aiKey.count({ where: { userId: alice } })).toBe(1);
    await deleteKey(alice, "OPENAI");
    expect(await getUserKey(alice, "OPENAI")).toBeNull();
  });

  it("counts shared-allowance documents and actions per user", async () => {
    const mk = (userId: string, aiSource: "USER" | "PLATFORM", name: string) =>
      db.chat.create({ data: { userId, name, pdfLink: "https://x.test/a.pdf", pdfStoragePath: `${userId}/a.pdf`, aiSource } });
    const a1 = await mk(alice, "PLATFORM", "one");
    await mk(alice, "PLATFORM", "two");
    await mk(alice, "USER", "three");
    expect(await countPlatformDocuments(alice)).toBe(2);
    expect(await countPlatformDocuments(alice, a1.id)).toBe(1); // re-indexing a document does not count it twice
    expect(await countPlatformDocuments(bob)).toBe(0);

    expect(await getActionsToday(alice)).toBe(0);
    expect(await addAction(alice)).toBe(1);
    expect(await addAction(alice)).toBe(2);
    expect(await getActionsToday(bob)).toBe(0);
  });

  it("removes keys, settings and usage with the account", async () => {
    const user = await db.user.create({ data: { email: "ai-temp@test.local", name: "t" } });
    await saveKey(user.id, "GOOGLE", "AIzaTempKey0123456789012345", true);
    await addAction(user.id);
    await db.user.delete({ where: { id: user.id } });
    expect(await db.aiKey.count({ where: { userId: user.id } })).toBe(0);
    expect(await db.aiUsage.count({ where: { userId: user.id } })).toBe(0);
  });
});
