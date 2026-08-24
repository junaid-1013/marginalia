// ENV
export const DATABASE_URL = process.env.DATABASE_URL;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const AUTH_SECRET = process.env.AUTH_SECRET;

// how many documents one account may keep (each one costs embeddings and LLM calls)
export const MAX_DOCUMENTS_PER_USER = Number(process.env.MAX_DOCUMENTS_PER_USER) || 10;
