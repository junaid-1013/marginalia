import { embed, generateText } from "ai";

import { AiKeyError, classifyAiError } from "@/lib/ai/errors";
import { buildChatModel, buildEmbeddingModel } from "@/lib/ai/provider";
import { EMBEDDING_DIMENSIONS, type ProviderId } from "@/lib/ai/providers";

/**
 * Proves a key works before it is saved: one tiny chat call and one tiny embedding call, with the
 * models the user picked. Costs a fraction of a cent. Throws an AiKeyError that is safe to show.
 */
export const testConnection = async ({
  provider,
  apiKey,
  chatModel,
  embedModel,
}: {
  provider: ProviderId;
  apiKey: string;
  chatModel: string;
  embedModel: string;
}) => {
  try {
    await generateText({
      model: buildChatModel(provider, apiKey, chatModel),
      prompt: "Reply with the single word: ok",
      maxTokens: 8,
      maxRetries: 0,
    });
  } catch (e) {
    throw classifyAiError(e, "user", chatModel);
  }

  let dimensions: number;
  try {
    dimensions = (
      await embed({ model: buildEmbeddingModel(provider, apiKey, embedModel), value: "test", maxRetries: 0 })
    ).embedding.length;
  } catch (e) {
    throw classifyAiError(e, "user", embedModel);
  }

  // the vector column has a fixed size: a model that cannot match it would break search later
  if (dimensions !== EMBEDDING_DIMENSIONS) {
    throw new AiKeyError(
      "BAD_MODEL",
      `The embedding model "${embedModel}" returns ${dimensions} values, Marginalia needs ${EMBEDDING_DIMENSIONS}. Choose another embedding model.`
    );
  }
  return { dimensions };
};
