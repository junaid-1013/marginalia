# Contributing to Marginalia

Thanks for wanting to help. Bug reports, fixes, docs and ideas are all welcome. This guide gets you from clone to pull request.

By taking part you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md). Contributions are licensed under the [Apache License 2.0](LICENSE), the same as the project.

## Before you start

- **Small fix** (typo, bug, test): open a pull request directly.
- **Bigger change** (new feature, new dependency, change to how data or keys are handled): open an issue first so we can agree on the approach before you spend time on it.
- **Security problem:** do not open a public issue. See [SECURITY.md](SECURITY.md).

## Set up

You need Node 20+ (or Bun), Docker, and a Vercel Blob store. The full walkthrough is in the [README](README.md#getting-started).

```bash
bun install
cp .env.example .env        # fill in the values
docker compose up -d        # Postgres + pgvector on port 5433
npx prisma migrate deploy
bun dev                     # http://localhost:3000
bun run dev:inngest         # second terminal, runs the background jobs
```

You can use your own OpenAI or Gemini key through **AI settings** in the app, so you do not need to put a shared key in `.env` to try things. To use the encrypted key storage locally, set `KEY_ENCRYPTION_SECRET` (`openssl rand -base64 32`).

## Checks to run before a pull request

```bash
bun run lint
npx tsc --noEmit
bun run test        # unit tests
bun run test:db     # adds the database tests (needs the Docker database)
```

CI runs the same checks. If you change behavior, add or update a test. Tests that touch the database live in `*.integration.test.ts`.

## Code guidelines

- Match the style around your change. Prefer small, focused pull requests over large mixed ones.
- Every API route must check that the signed-in user owns the data it touches, and validate input with zod. Another user's document is a `404`, never a `403`.
- Never log, return or store an AI key in plain text, and never put one in an Inngest event. Keys go through `src/lib/crypto.ts` and `src/services/db/ai.ts` only.
- Document text is untrusted input to the model. Do not let the client set the system prompt.
- Embedding models must output 1536 dimensions (the `Chunk.embedding` column).
- UI: use the tokens and components in `src/components/ui` and check `/design` (development only) in light and dark. Keep it keyboard accessible, and run axe if you change layout.
- Database changes need a Prisma migration. If `prisma migrate dev` proposes `DROP INDEX "Chunk_embedding_idx"`, delete that line from the migration (Prisma cannot represent the HNSW index).

## Commits and pull requests

- Use short, imperative commit subjects, in the style of the history (`feat: ...`, `fix: ...`, `docs: ...`).
- In the pull request, say what changed and why, how you tested it, and add screenshots for UI changes.
- Keep the branch up to date with `main` and make sure checks pass.

## Good first contributions

- Reading scanned (image-only) PDFs
- Sharing the rate limiter across instances (Redis)
- Moving to Next.js 15 / React 19
- More providers (they must support 1536-dimension embeddings, or the schema needs an approach for other sizes)
- Accessibility and translation improvements

Questions are welcome in an issue. Thank you for helping.
