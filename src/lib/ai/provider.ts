import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import type { EmbeddingModel, LanguageModel } from "ai";

import { EMBEDDING_DIMENSIONS, type ProviderId } from "@/lib/ai/providers";

// An operator (not a user) can point the app at a compatible server, for example a local one for
// self-hosting or tests. Users can never set a URL, so there is no way to aim the server somewhere else.
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || undefined;
const GOOGLE_BASE_URL = process.env.GOOGLE_BASE_URL || undefined;

export const buildChatModel = (provider: ProviderId, apiKey: string, model: string): LanguageModel =>
  provider === "GOOGLE"
    ? createGoogleGenerativeAI({ apiKey, baseURL: GOOGLE_BASE_URL })(model)
    : createOpenAI({ apiKey, baseURL: OPENAI_BASE_URL })(model);

export const buildEmbeddingModel = (
  provider: ProviderId,
  apiKey: string,
  model: string
): EmbeddingModel<string> =>
  provider === "GOOGLE"
    ? createGoogleGenerativeAI({ apiKey, baseURL: GOOGLE_BASE_URL }).textEmbeddingModel(model, {
        outputDimensionality: EMBEDDING_DIMENSIONS,
      })
    : createOpenAI({ apiKey, baseURL: OPENAI_BASE_URL }).embedding(
        model,
        // the text-embedding-3 models can be asked for exactly the size of our vector column
        model.startsWith("text-embedding-3") ? { dimensions: EMBEDDING_DIMENSIONS } : undefined
      );
