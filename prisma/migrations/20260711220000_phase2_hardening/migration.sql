-- DropForeignKey
ALTER TABLE "Word" DROP CONSTRAINT "Word_summaryId_fkey";

-- DropIndex
DROP INDEX "Chat_name_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerified",
ADD COLUMN     "emailVerified" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Chat_userId_name_key" ON "Chat"("userId", "name");

-- CreateIndex
CREATE INDEX "Message_chatId_createdAt_idx" ON "Message"("chatId", "createdAt");

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_summaryId_fkey" FOREIGN KEY ("summaryId") REFERENCES "Summary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

