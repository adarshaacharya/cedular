-- CreateTable
CREATE TABLE "email_messages" (
    "id" TEXT NOT NULL,
    "emailThreadId" TEXT NOT NULL,
    "gmailMessageId" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT[],
    "cc" TEXT[],
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "snippet" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_messages_gmailMessageId_key" ON "email_messages"("gmailMessageId");

-- CreateIndex
CREATE INDEX "email_messages_emailThreadId_idx" ON "email_messages"("emailThreadId");

-- CreateIndex
CREATE INDEX "email_messages_gmailMessageId_idx" ON "email_messages"("gmailMessageId");

-- CreateIndex
CREATE INDEX "email_messages_sentAt_idx" ON "email_messages"("sentAt");

-- AddForeignKey
ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_emailThreadId_fkey" FOREIGN KEY ("emailThreadId") REFERENCES "email_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
