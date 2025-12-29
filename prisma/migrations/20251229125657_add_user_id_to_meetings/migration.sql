/*
  Warnings:

  - Added the required column `userId` to the `meetings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."meetings" DROP CONSTRAINT "meetings_emailThreadId_fkey";

-- AlterTable
ALTER TABLE "meetings" ADD COLUMN     "userId" TEXT,
ALTER COLUMN "emailThreadId" DROP NOT NULL;

-- Populate userId from emailThread.userId for existing meetings
UPDATE "meetings"
SET "userId" = "email_threads"."userId"
FROM "email_threads"
WHERE "meetings"."emailThreadId" = "email_threads"."id";

-- Make userId NOT NULL after populating data
ALTER TABLE "meetings" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "meetings_userId_idx" ON "meetings"("userId");

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_emailThreadId_fkey" FOREIGN KEY ("emailThreadId") REFERENCES "email_threads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
