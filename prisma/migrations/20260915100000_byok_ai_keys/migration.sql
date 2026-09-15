-- CreateEnum
CREATE TYPE "AiProvider" AS ENUM ('OPENAI', 'GOOGLE');

-- CreateEnum
CREATE TYPE "AiSource" AS ENUM ('USER', 'PLATFORM');

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "aiSource" "AiSource",
ADD COLUMN     "embedModel" TEXT,
ADD COLUMN     "embedProvider" "AiProvider",
ADD COLUMN     "errorCode" TEXT;

-- CreateTable
CREATE TABLE "AiKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "AiProvider" NOT NULL,
    "cipher" TEXT NOT NULL,
    "last4" TEXT NOT NULL,
    "keyVersion" INTEGER NOT NULL DEFAULT 1,
    "validatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chatProvider" "AiProvider" NOT NULL DEFAULT 'OPENAI',
    "chatModel" TEXT NOT NULL,
    "embedProvider" "AiProvider" NOT NULL DEFAULT 'OPENAI',
    "embedModel" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiUsage" (
    "userId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "chatMessages" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AiUsage_pkey" PRIMARY KEY ("userId","day")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiKey_userId_provider_key" ON "AiKey"("userId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "AiSettings_userId_key" ON "AiSettings"("userId");

-- AddForeignKey
ALTER TABLE "AiKey" ADD CONSTRAINT "AiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiSettings" ADD CONSTRAINT "AiSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiUsage" ADD CONSTRAINT "AiUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Documents indexed before per-user keys were built with the platform key and OpenAI's text-embedding-3-small
UPDATE "Chat" c
SET "embedProvider" = 'OPENAI', "embedModel" = 'text-embedding-3-small'
WHERE EXISTS (SELECT 1 FROM "Chunk" k WHERE k."chatId" = c."id" AND k."embedding" IS NOT NULL);
