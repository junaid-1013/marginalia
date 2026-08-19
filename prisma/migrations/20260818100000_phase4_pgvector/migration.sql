-- pgvector replaces Qdrant: embeddings live next to the chunks they belong to
CREATE EXTENSION IF NOT EXISTS vector;

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "collectionName";

-- AlterTable
ALTER TABLE "Chunk" ADD COLUMN "embedding" vector(1536);

-- Approximate nearest neighbour index (cosine). Prisma 5.11 cannot represent it in schema.prisma, so
-- `prisma migrate dev` will propose `DROP INDEX "Chunk_embedding_idx"`: delete that line from new migrations.
CREATE INDEX "Chunk_embedding_idx" ON "Chunk" USING hnsw ("embedding" vector_cosine_ops);

-- Documents indexed in Qdrant have no embeddings here: ask the user to re-process
UPDATE "Chat"
SET "status" = 'FAILED',
    "processingError" = 'Search was upgraded. Please retry to re-process this document.';
