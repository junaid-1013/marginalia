export const SITE_NAME = "Marginalia";
export const SITE_TAGLINE = "Dense texts, decoded into active recall.";
export const SITE_DESCRIPTION =
  "Upload a PDF, ask it questions, and study from summaries, flashcards and quizzes. Every answer points to the page it came from.";

// set NEXT_PUBLIC_SITE_URL once the domain is decided; Vercel's production url is the fallback
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const REPO_URL = "https://github.com/junaid-1013/marginalia";
