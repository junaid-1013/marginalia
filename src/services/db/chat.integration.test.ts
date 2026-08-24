// Needs a real database with the migrations applied:
//   docker compose up -d && DATABASE_URL=... DIRECT_URL=... npx prisma migrate deploy
//   bun run test:db
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { db } from "@/lib/db";
import {
  getChatFlashcards,
  getChatSummary,
  getUserChat,
  initializeChat,
  saveFlashcards,
  saveSummary,
} from "@/services/db/chat";

const run = process.env.RUN_DB_TESTS ? describe : describe.skip;

run("chat service (database)", () => {
  let alice: string, bob: string;
  const created: string[] = [];

  beforeAll(async () => {
    const mk = (email: string) =>
      db.user.upsert({ where: { email }, update: {}, create: { email, name: email } });
    alice = (await mk("it-alice@test.local")).id;
    bob = (await mk("it-bob@test.local")).id;
  });

  afterAll(async () => {
    await db.chat.deleteMany({ where: { userId: { in: [alice, bob] } } });
    await db.user.deleteMany({ where: { id: { in: [alice, bob] } } });
    await db.$disconnect();
  });

  const make = async (userId: string, name: string) => {
    const chat = await initializeChat({ userId, name, pdfLink: "https://x.test/a.pdf", pdfStoragePath: `${userId}/a.pdf` });
    created.push(chat.id);
    return chat;
  };

  it("only returns a chat to its owner", async () => {
    const chat = await make(alice, "owned");
    expect(await getUserChat(chat.id, alice)).not.toBeNull();
    expect(await getUserChat(chat.id, bob)).toBeNull();
  });

  it("allows the same name for different users but not twice for one user", async () => {
    await make(alice, "same name");
    await make(bob, "same name");
    await expect(make(alice, "same name")).rejects.toThrow(/already have/i);
  });

  it("replaces summary and flashcards instead of failing or duplicating", async () => {
    const chat = await make(alice, "regen");
    const summary = (t: string) => ({
      introduction: t, abstract: t, keyTakeaways: [t], tldr: t,
      mostUsedWords: [{ text: t, value: 1 }],
    });
    await saveSummary({ chatId: chat.id, summary: summary("one") });
    await saveSummary({ chatId: chat.id, summary: summary("two") });
    const stored = await getChatSummary(chat.id);
    expect(stored?.introduction).toBe("two");
    expect(stored?.mostUsedWords).toHaveLength(1);

    await saveFlashcards({ chatId: chat.id, flashcards: [{ question: "q1", answer: "a1" }, { question: "q2", answer: "a2" }] });
    await saveFlashcards({ chatId: chat.id, flashcards: [{ question: "q3", answer: "a3" }] });
    expect(await getChatFlashcards(chat.id)).toHaveLength(1);
  });

  it("deleting a chat removes everything derived from it", async () => {
    const chat = await make(alice, "cascade");
    await saveSummary({ chatId: chat.id, summary: { introduction: "i", abstract: "a", keyTakeaways: [], tldr: "t", mostUsedWords: [{ text: "w", value: 1 }] } });
    await saveFlashcards({ chatId: chat.id, flashcards: [{ question: "q", answer: "a" }] });
    await db.message.create({ data: { chatId: chat.id, role: "user", content: "hi" } });
    await db.chunk.create({ data: { chatId: chat.id, index: 0, content: "text" } });
    await db.quizQuestion.create({ data: { chatId: chat.id, index: 0, question: "q", options: ["a", "b", "c", "d"], answerIndex: 0, explanation: "e" } });

    await db.chat.delete({ where: { id: chat.id } });

    const where = { chatId: chat.id };
    expect(await db.message.count({ where })).toBe(0);
    expect(await db.chunk.count({ where })).toBe(0);
    expect(await db.flashcard.count({ where })).toBe(0);
    expect(await db.quizQuestion.count({ where })).toBe(0);
    expect(await db.summary.count({ where })).toBe(0);
    expect(await db.word.count({ where: { summary: { chatId: chat.id } } })).toBe(0);
  });
});
