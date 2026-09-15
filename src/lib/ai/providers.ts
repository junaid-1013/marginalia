// What the app knows about each supported provider. Shared by the server and the settings form, so it
// imports nothing server side.

export type ProviderId = "OPENAI" | "GOOGLE";

/** The pgvector column is vector(1536): an embedding model is only usable if it can output exactly this. */
export const EMBEDDING_DIMENSIONS = 1536;

export interface IProviderInfo {
  label: string;
  /** shown as suggestions: any model name the provider accepts can be typed */
  chatModels: string[];
  defaultChat: string;
  embedModels: string[];
  defaultEmbed: string;
  /** where to create a key */
  keyUrl: string;
  keyExample: string;
  note?: string;
}

export const PROVIDERS: Record<ProviderId, IProviderInfo> = {
  OPENAI: {
    label: "OpenAI",
    chatModels: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini"],
    defaultChat: "gpt-4o-mini",
    embedModels: ["text-embedding-3-small", "text-embedding-3-large"],
    defaultEmbed: "text-embedding-3-small",
    keyUrl: "https://platform.openai.com/api-keys",
    keyExample: "sk-...",
  },
  GOOGLE: {
    label: "Google Gemini",
    chatModels: ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro"],
    defaultChat: "gemini-2.5-flash",
    embedModels: ["gemini-embedding-001"],
    defaultEmbed: "gemini-embedding-001",
    keyUrl: "https://aistudio.google.com/apikey",
    keyExample: "AIza...",
    note: "Google AI Studio offers a free tier, so this can cost nothing.",
  },
};

export const PROVIDER_IDS = Object.keys(PROVIDERS) as ProviderId[];

export const isProviderId = (value: unknown): value is ProviderId =>
  typeof value === "string" && value in PROVIDERS;

// A key is only worth saving if it has the right shape: catches pasting the wrong thing.
const KEY_SHAPE: Record<ProviderId, RegExp> = {
  OPENAI: /^sk-[A-Za-z0-9_\-]{16,}$/,
  GOOGLE: /^AIza[0-9A-Za-z_\-]{20,}$/,
};
export const looksLikeKey = (provider: ProviderId, key: string) => KEY_SHAPE[provider].test(key.trim());
