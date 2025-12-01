/*
  Warnings:

  - The `status` column on the `email_threads` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `intent` column on the `email_threads` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `meetings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

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

-- AlterTable
ALTER TABLE "meetings" DROP COLUMN "status",
ADD COLUMN     "status" "MeetingStatus" NOT NULL DEFAULT 'proposed';

-- CreateIndex
CREATE INDEX "email_threads_status_idx" ON "email_threads"("status");
