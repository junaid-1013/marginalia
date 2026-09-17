# Marginalia

**Dense texts, decoded into active recall.**

**Live demo: [marginalia-jj.vercel.app](https://marginalia-jj.vercel.app)** · Apache-2.0 · bring your own OpenAI or Gemini key

Upload a PDF, then question it, summarize it and quiz yourself on it. Every answer points to the page it came from, and clicking a page opens the PDF right there.

<p align="center">
  <img src=".github/assets/landing.png" alt="Marginalia landing page with the interactive demo" width="900">
</p>

## What it does

- **Chat with citations.** Ask in plain language. Answers are written from your document only, cite pages like `(p. 12)`, and each citation is a link that opens the PDF at that page. If the document does not contain the answer, it says so.
- **Summary.** A one-line TL;DR, key takeaways, an introduction, an abstract and a word cloud.
- **Flashcards.** Flip a card, then say whether you knew it. Cards you missed come back as their own round (active recall, not a slideshow).
- **Quiz.** Ten multiple-choice questions with explanations, a score, and a review of what you missed with the option to retry only those.
- **Notes.** A rich-text editor next to the document, autosaved.
- **Bring your own key.** Add your OpenAI or Google Gemini key in AI settings. It is encrypted, never shown again, and used only for your documents. A small shared allowance can cover first use.
- **Background processing.** Uploading returns immediately. Reading, indexing and generating run as durable background steps, with live status and retries.
- **A guided tour** for first-time users, and keyboard shortcuts (`/` to chat, `g` then `d n s f q` to switch tool).

| Dashboard | Workspace |
| --- | --- |
| <img src=".github/assets/dashboard.png" alt="Document dashboard with status badges"> | <img src=".github/assets/workspace.png" alt="Summary next to the chat"> |
| **Flashcards** | **Quiz** |
| <img src=".github/assets/flashcards.png" alt="Flashcard showing its answer"> | <img src=".github/assets/quiz.png" alt="Quiz question with explanation"> |

<details>
<summary>Dark mode and phone layouts</summary>

| Workspace (dark) | Notes (dark) |
| --- | --- |
| <img src=".github/assets/workspace-dark.png" alt="Workspace in dark mode"> | <img src=".github/assets/notes-dark.png" alt="Notes editor in dark mode"> |

<p>
  <img src=".github/assets/mobile-landing.png" alt="Landing page on a phone" width="260">
  <img src=".github/assets/mobile-chat.png" alt="Chat tab on a phone" width="260">
</p>

</details>

## How it works

```mermaid
flowchart LR
  B[Browser] -- "1 upload token" --> API[Next.js API]
  B -- "2 PDF, direct" --> Blob[(Vercel Blob)]
  B -- "3 create document" --> API
  API --> DB[(Postgres + pgvector)]
  API -- "document/uploaded" --> Q[Inngest]
  Q --> S["parse pages, split, embed,<br/>then summary / flashcards / quiz"]
  S --> Blob
  S --> DB
  S --> LLM[OpenAI-compatible model]
  B -- "chat question" --> API
  API -- "nearest chunks of this document" --> DB
  API -- "streamed answer + sources" --> LLM
```

1. The browser asks the server for a short-lived upload token, then uploads the PDF **straight to Vercel Blob** (so the file never passes through a serverless body limit).
2. Creating the document sends an event to **Inngest**. Its steps download the PDF, extract text per page, split it into chunks (page numbers kept), embed the chunks and store the vectors in **Postgres with pgvector**. Summary and flashcards then run in parallel; the quiz is generated on demand.
3. Each step has retries and writes a status (`PENDING`, `PROCESSING`, `READY`, `FAILED`) that the UI polls.
4. A chat question is embedded, the closest chunks **of that document only** are retrieved, and the model streams an answer. The pages used are sent along as annotations and stored with the message.

## Tech stack

| Layer | Choice |
| --- | --- |
| App | Next.js 14 (App Router), React 18, TypeScript |
| UI | Tailwind, Radix primitives, shadcn-style components, own design system (see below) |
| Data | Postgres + Prisma, pgvector for embeddings |
| Files | Vercel Blob (private store supported) |
| Background jobs | Inngest |
| AI | Vercel AI SDK (`streamText`, `generateObject`, `embedMany`), any OpenAI-compatible provider |
| Auth | Auth.js (next-auth v5 beta), credentials + optional Google, JWT sessions |
| Editor | BlockNote |
| Tests | Vitest (unit + database integration), axe-core and Lighthouse for a11y and performance checks |

## Getting started

You need Node 20+ (or Bun), Docker, a Vercel Blob store and an OpenAI-compatible API key.

```bash
bun install
cp .env.example .env     # then fill in the values below
docker compose up -d     # Postgres with pgvector on port 5433
npx prisma migrate deploy
```

Run the app and the background worker in two terminals:

```bash
bun dev                  # http://localhost:3000
bun run dev:inngest      # Inngest dev server, http://localhost:8288
```

Without the Inngest terminal a new document stays unprocessed (it is marked failed with a Retry button).

### Environment

| Variable | Needed | Notes |
| --- | --- | --- |
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED` | yes | Postgres with pgvector. Locally `postgresql://postgres:postgres@localhost:5433/innovated` for both. On Neon use the pooled URL and the direct URL |
| `AUTH_SECRET` | yes | any long random string (`npx auth secret`) |
| `BLOB_READ_WRITE_TOKEN` | yes | Vercel dashboard, Storage, your Blob store. There is no local emulator |
| `NEXT_PUBLIC_BLOB_ACCESS` | no | `private` (default) or `public`, must match how the store was created |
| `OPENAI_API_KEY` | one of the two | shared OpenAI key, needs credit. `OPENAI_BASE_URL` points it at any compatible server (for example Ollama) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | one of the two | shared Gemini key. `GOOGLE_BASE_URL` is optional |
| `KEY_ENCRYPTION_SECRET` | for BYOK | 32 bytes, base64 (`openssl rand -base64 32`). Encrypts users' saved keys. Losing it makes them unreadable |
| `KEY_ENCRYPTION_VERSION` | no | default 1. See rotation below |
| `ALLOW_PLATFORM_KEY` | no | `false` forces every user to bring a key |
| `PLATFORM_FREE_DOCUMENTS`, `PLATFORM_FREE_ACTIONS_PER_DAY` | no | shared key allowance per user. Empty or 0 = unlimited (self hosting). Set both on a public deploy |
| `AI_CHAT_MODEL`, `AI_EMBED_MODEL` | no | defaults `gpt-4o-mini` and `text-embedding-3-small`. The embedding model must output **1536 dimensions** |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | no | enables "Continue with Google" |
| `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` | production | set by the Inngest integration on Vercel. Not needed locally |
| `MAX_DOCUMENTS_PER_USER` | no | default 10 |
| `NEXT_PUBLIC_SITE_URL` | no | canonical URL for metadata and the sitemap |

### Bring your own key

Users open **AI settings** (profile menu), pick OpenAI or Gemini for chat and for embeddings, and paste a key. The key is test-called once, then stored encrypted (AES-256-GCM, bound to the account). It is decrypted in memory per request, never returned by any API, never logged and never put in Inngest events.

Order used for each request: the user's own key, then the shared env key while the allowance lasts, otherwise the user is asked to add a key. Each document remembers which embedding model indexed it and questions use that same model, so changing models never breaks old documents.

**Rotating the master secret:** set `KEY_ENCRYPTION_VERSION=2`, set `KEY_ENCRYPTION_SECRET` to the new value and keep the old one as `KEY_ENCRYPTION_SECRET_V1`. Old keys stay readable and are re-encrypted when the user saves again.

### Scripts

| Command | What it does |
| --- | --- |
| `bun dev` | development server |
| `bun run dev:inngest` | Inngest dev server for the background jobs |
| `bun run build` / `bun start` | production build and server |
| `bun run lint` | ESLint |
| `bun run test` | unit tests |
| `bun run test:db` | adds the database integration tests (needs the Docker database) |

### Good to know

- `/design` (development only) shows every design token and component in light and dark.
- A second server or a test build can use its own folder with `NEXT_DIST_DIR=.next-test`, so it never overwrites a running `next dev`.
- Prisma cannot represent the HNSW vector index. If `prisma migrate dev` proposes `DROP INDEX "Chunk_embedding_idx"`, delete that line from the new migration.

## Design

Paper, ink and one highlighter. The signature is the **margin**: a notebook rule and annotations hanging beside the text they explain, used for citations, recall cues and notes.

- Type: Newsreader for headings and reading, Hanken Grotesk for the interface.
- Colour: paper and ink navy, with highlighter amber as the only loud colour. Light and midnight-ink dark themes from the same tokens.
- Depth comes from tone shifts and hairlines, not shadows.
- Accessibility: axe-core reports no violations on the landing page, auth pages, dashboard, every workspace tool and the 404 page, in both themes. Focus rings, keyboard flows and reduced motion are covered.

## Security

- Every API route checks that the signed-in user owns the document (another user's document is a 404, never a 403), validates its input with zod, and the model-backed ones are rate limited per user.
- PDFs live in a private Blob store and are served only to their owner through an authenticated route. The server accepts only the blob it issued an upload token for (no arbitrary URLs).
- Document text is treated as untrusted input to the model, and the client can never set the system prompt.
- Saved AI keys are encrypted at rest, scoped to their owner and redacted from logs. Users cannot set provider URLs, so a key can only be sent to the official endpoints. See the [privacy notice](/privacy).
- Credentials never go in a URL: the auth forms post by default.

## Project structure

```
src/
  app/            routes: landing, auth, dashboard, workspace tools, API
  components/     ui (primitives), landing, workspace, study tools, chat, tour
  lib/ai/         pdf extraction, chunking, embeddings, retrieval, chat, map-reduce
  inngest/        the background pipeline (process, summary, flashcards, quiz)
  services/db/    data access, always scoped to the signed-in user
prisma/           schema and migrations (pgvector included)
```

## Known limitations

- Scanned (image-only) PDFs have no text layer and are not supported yet.
- The rate limiter is in memory (per server instance). Swap its store for Redis before real traffic.
- The app is on Next.js 14. Next 14 no longer receives security fixes; moving to Next 15 / React 19 is the next planned upgrade (the notes editor is the last dependency that blocks it).

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) for setup and guidelines, and report security problems privately as described in [SECURITY.md](SECURITY.md). Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

[Apache License 2.0](LICENSE). See [NOTICE](NOTICE).
