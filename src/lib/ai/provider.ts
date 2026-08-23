import { createOpenAI } from "@ai-sdk/openai";

import { OPENAI_API_KEY } from "@/constants";

// OPENAI_BASE_URL lets this point at any OpenAI compatible server
// (Azure, OpenRouter, a local Ollama at http://localhost:11434/v1, ...).
const provider = createOpenAI({
  apiKey: OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || undefined,
});

export const CHAT_MODEL_ID = process.env.AI_CHAT_MODEL || "gpt-4o-mini";
// The vector column is vector(1536), so the embedding model must output 1536 dims.
export const EMBED_MODEL_ID =
  process.env.AI_EMBED_MODEL || "text-embedding-3-small";

export const chatModel = () => provider(CHAT_MODEL_ID);
export const embeddingModel = () => provider.embedding(EMBED_MODEL_ID);
