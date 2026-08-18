import * as z from "zod";

import { IMapReduceConfig } from "@/lib/ai/map-reduce";

export const summarySchema = z.object({
  introduction: z
    .string()
    .describe(
      "Imagine you're providing an introduction to a document. Write a brief introduction that outlines the purpose and context of the document"
    ),
  abstract: z
    .string()
    .describe(
      "Craft a formal abstract for the document. Summarize the key points and main arguments in a concise format"
    ),
  keyTakeaways: z
    .array(z.string())
    .describe(
      "List the key takeaways from the document. Provide a brief description for each point to highlight the main insights"
    ),
  tldr: z
    .string()
    .describe(
      "Create a TLDR summary for the document. Capture the essence of the content in a short and easily digestible format"
    ),
  mostUsedWords: z
    .array(z.object({ text: z.string(), value: z.number() }))
    .min(1)
    .max(100)
    .describe(
      "Select the most important words from the document for a word cloud. List them with their relevance or importance."
    ),
});

export const summaryConfig: IMapReduceConfig<typeof summarySchema> = {
  name: "summary",
  schema: summarySchema,
  mapPrompt: (text) => `Summarize this content:\n\n${text}`,
  collapsePrompt: (text) => `Collapse this content:\n\n${text}`,
  reducePrompt: (text, format) =>
    `Combine these summaries:\n\n${text}\n${format}`,
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
  mapPrompt: (text) =>
    `Imagine you're crafting flashcards to help students memorize key information effectively. Summarize the main points or interesting facts from this context:\n\n${text}`,
  collapsePrompt: (text) =>
    `Now, condense the summarized content into a concise format suitable for flashcards:\n\n${text}`,
  reducePrompt: (text, format) =>
    `You're preparing a comprehensive set of flashcards for student assessment. Integrate these condensed flashcards into an effective quiz format:\n\n${text}\n${format}`,
};
