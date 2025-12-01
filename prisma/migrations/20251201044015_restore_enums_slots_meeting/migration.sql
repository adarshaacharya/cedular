/*
  Warnings:

  - The `status` column on the `email_threads` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `intent` column on the `email_threads` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EmailThreadStatus" AS ENUM ('pending', 'processing', 'scheduled', 'awaiting_confirmation', 'confirmed', 'failed');

-- CreateEnum
CREATE TYPE "EmailThreadIntent" AS ENUM ('schedule', 'reschedule', 'cancel', 'confirm');

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('proposed', 'confirmed', 'cancelled');

-- AlterTable
ALTER TABLE "email_threads" ADD COLUMN     "proposedSlots" JSONB,
DROP COLUMN "status",
ADD COLUMN     "status" "EmailThreadStatus" NOT NULL DEFAULT 'pending',
DROP COLUMN "intent",
ADD COLUMN     "intent" "EmailThreadIntent";

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
    "status" "MeetingStatus" NOT NULL DEFAULT 'proposed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "meetings_emailThreadId_idx" ON "meetings"("emailThreadId");

-- CreateIndex
CREATE INDEX "email_threads_status_idx" ON "email_threads"("status");

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_emailThreadId_fkey" FOREIGN KEY ("emailThreadId") REFERENCES "email_threads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
