import { ChatOpenAI } from "@langchain/openai";

import { OPENAI_API_KEY } from "@/constants";

export const CHAT_MODEL = process.env.AI_CHAT_MODEL ?? "gpt-3.5-turbo";

export const createChatModel = (options?: { temperature?: number }) =>
  new ChatOpenAI({
    modelName: CHAT_MODEL,
    temperature: options?.temperature ?? 0.2,
    openAIApiKey: OPENAI_API_KEY,
  });
