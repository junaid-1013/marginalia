import { z } from "zod";

import { IMapReduceConfig } from "@/lib/ai/map-reduce";

export const MAX_WORDS = 100;

export const summarySchema = z.object({
  introduction: z
    .string()
    .describe(
      "A brief introduction that outlines the purpose and context of the document"
    ),
  abstract: z
    .string()
    .describe(
      "A formal abstract: the key points and main arguments in a concise format"
    ),
  keyTakeaways: z
    .array(z.string())
    .describe("The key takeaways, each with a brief description of the insight"),
  tldr: z
    .string()
    .describe("A TLDR capturing the essence of the content in a few sentences"),
  mostUsedWords: z
    .array(z.object({ text: z.string(), value: z.number() }))
    .describe(
      `Up to ${MAX_WORDS} of the most important words in the document for a word cloud, with their relevance`
    ),
});

export const summaryConfig: IMapReduceConfig<typeof summarySchema> = {
  name: "summary",
  schema: summarySchema,
  mapInstruction: "Summarize this excerpt of a document.",
  collapseInstruction: "Condense these partial summaries into one shorter summary.",
  reduceInstruction:
    "These are summaries of consecutive parts of one document. Combine them into a summary of the whole document.",
};

export const flashcardsSchema = z.object({
  flashcards: z.array(
    z.object({
      question: z.string().describe("Question or knowledge of the flashcard"),
      answer: z.string().describe("Answer or value to the question or knowledge"),
    })
  ),
});

export const flashcardsConfig: IMapReduceConfig<typeof flashcardsSchema> = {
  name: "flashcards",
  schema: flashcardsSchema,
  mapInstruction:
    "You are crafting flashcards to help students memorize key information. List the main points and interesting facts of this excerpt.",
  collapseInstruction:
    "Condense these notes into a shorter list that is still suitable for flashcards.",
  reduceInstruction:
    "You are preparing a comprehensive set of flashcards for student assessment. Turn these notes into question and answer flashcards covering the whole document.",
};

export const QUIZ_QUESTIONS = 10;

export const quizSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()).describe("Exactly 4 answer options"),
      answerIndex: z
        .number()
        .describe("Zero based index (0-3) of the correct option"),
      explanation: z
        .string()
        .describe("One or two sentences on why the answer is correct"),
    })
  ),
});

export const quizConfig: IMapReduceConfig<typeof quizSchema> = {
  name: "quiz",
  schema: quizSchema,
  mapInstruction:
    "List the concrete facts, definitions and relationships in this excerpt that make good multiple choice quiz questions.",
  collapseInstruction:
    "Condense these notes into a shorter list of facts that still supports quiz questions.",
  reduceInstruction: `Write ${QUIZ_QUESTIONS} multiple choice questions covering the whole document, based only on these notes. Each question has exactly 4 options, one clearly correct, plausible distractors, and a short explanation.`,
};
