-- CreateTable
CREATE TABLE "meetings" (
    "id" TEXT NOT NULL,
    "emailThreadId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "participants" TEXT[],
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL,
    "calendarEventId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "meetings_emailThreadId_idx" ON "meetings"("emailThreadId");

-- CreateIndex
CREATE INDEX "meetings_startTime_idx" ON "meetings"("startTime");

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_emailThreadId_fkey" FOREIGN KEY ("emailThreadId") REFERENCES "email_threads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
