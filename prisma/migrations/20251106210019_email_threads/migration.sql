-- CreateTable
CREATE TABLE "email_threads" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "subject" TEXT,
    "participants" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'pending',
    "intent" TEXT,
    "workflowRunId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_threads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_threads_threadId_key" ON "email_threads"("threadId");

-- CreateIndex
CREATE INDEX "email_threads_userId_idx" ON "email_threads"("userId");

-- CreateIndex
CREATE INDEX "email_threads_status_idx" ON "email_threads"("status");

-- CreateIndex
CREATE INDEX "email_threads_threadId_idx" ON "email_threads"("threadId");

-- AddForeignKey
ALTER TABLE "email_threads" ADD CONSTRAINT "email_threads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
