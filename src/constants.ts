// ENV
export const DATABASE_URL = process.env.DATABASE_URL;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const AUTH_SECRET = process.env.AUTH_SECRET;
export const QDRANT = {
  url: process.env.QDRANT_HOST,
  apiKey: process.env.QDRANT_API_KEY,
  collection: process.env.QDRANT_COLLECTION,
};
