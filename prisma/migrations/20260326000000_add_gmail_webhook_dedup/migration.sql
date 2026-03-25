-- Dedupe Gmail webhook starts to avoid overlapping history workflow runs
-- for the same user/history window.

CREATE TABLE "gmail_webhook_dedup" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "historyId" TEXT NOT NULL,
    "notificationMessageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gmail_webhook_dedup_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "gmail_webhook_dedup_userId_historyId_key"
ON "gmail_webhook_dedup"("userId", "historyId");

CREATE UNIQUE INDEX "gmail_webhook_dedup_userId_notificationMessageId_key"
ON "gmail_webhook_dedup"("userId", "notificationMessageId");

CREATE INDEX "gmail_webhook_dedup_userId_createdAt_idx"
ON "gmail_webhook_dedup"("userId", "createdAt");
