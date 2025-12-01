/*
  Warnings:

  - You are about to drop the column `proposedSlots` on the `email_threads` table. All the data in the column will be lost.
  - The `status` column on the `email_threads` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `intent` column on the `email_threads` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `meetings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."meetings" DROP CONSTRAINT "meetings_emailThreadId_fkey";

-- AlterTable
ALTER TABLE "email_threads" DROP COLUMN "proposedSlots",
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
DROP COLUMN "intent",
ADD COLUMN     "intent" TEXT;

-- DropTable
DROP TABLE "public"."meetings";

-- DropEnum
DROP TYPE "public"."EmailThreadIntent";

-- DropEnum
DROP TYPE "public"."EmailThreadStatus";

-- DropEnum
DROP TYPE "public"."MeetingStatus";

-- CreateIndex
CREATE INDEX "email_threads_status_idx" ON "email_threads"("status");
