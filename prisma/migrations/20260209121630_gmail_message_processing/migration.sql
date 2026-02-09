-- CreateEnum
CREATE TYPE "GmailMessageProcessingStatus" AS ENUM ('pending', 'processed', 'failed', 'dead');

-- CreateTable
CREATE TABLE "gmail_message_processing" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gmailMessageId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "status" "GmailMessageProcessingStatus" NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "lastAttemptAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gmail_message_processing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gmail_message_processing_userId_status_idx" ON "gmail_message_processing"("userId", "status");

-- CreateIndex
CREATE INDEX "gmail_message_processing_threadId_idx" ON "gmail_message_processing"("threadId");

-- CreateIndex
CREATE UNIQUE INDEX "gmail_message_processing_userId_gmailMessageId_key" ON "gmail_message_processing"("userId", "gmailMessageId");

-- AddForeignKey
ALTER TABLE "gmail_message_processing" ADD CONSTRAINT "gmail_message_processing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
