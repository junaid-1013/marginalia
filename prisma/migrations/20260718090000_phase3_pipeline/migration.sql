-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('IDLE', 'PENDING', 'PROCESSING', 'READY', 'FAILED');

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "flashcardsStatus" "JobStatus" NOT NULL DEFAULT 'IDLE',
ADD COLUMN     "processingError" TEXT,
ADD COLUMN     "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "summaryStatus" "JobStatus" NOT NULL DEFAULT 'IDLE';

-- CreateTable
CREATE TABLE "Chunk" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "page" INTEGER,
    "content" TEXT NOT NULL,

    CONSTRAINT "Chunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Chunk_chatId_index_key" ON "Chunk"("chatId", "index");

-- AddForeignKey
ALTER TABLE "Chunk" ADD CONSTRAINT "Chunk_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Existing rows were processed by the old synchronous flow: mark them as done
UPDATE "Chat" SET "status" = 'READY';
UPDATE "Chat" SET "summaryStatus" = 'READY' WHERE EXISTS (SELECT 1 FROM "Summary" WHERE "Summary"."chatId" = "Chat"."id");
UPDATE "Chat" SET "flashcardsStatus" = 'READY' WHERE EXISTS (SELECT 1 FROM "Flashcard" WHERE "Flashcard"."chatId" = "Chat"."id");
