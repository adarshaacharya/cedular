/*
  Warnings:

  - You are about to drop the column `timezone` on the `user_preferences` table. All the data in the column will be lost.

*/

-- CreateTable
CREATE TABLE "user_schedule_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "workingHoursStart" TEXT NOT NULL DEFAULT '09:00',
    "workingHoursEnd" TEXT NOT NULL DEFAULT '17:00',
    "bufferMinutes" INTEGER NOT NULL DEFAULT 15,
    "preferredTimes" JSONB,
    "avoidTimes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_schedule_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_schedule_profiles_userId_key" ON "user_schedule_profiles"("userId");

-- CreateIndex
CREATE INDEX "user_schedule_profiles_userId_idx" ON "user_schedule_profiles"("userId");

-- AddForeignKey
ALTER TABLE "user_schedule_profiles" ADD CONSTRAINT "user_schedule_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: Create schedule profile for each user, copying timezone from user_preferences
INSERT INTO "user_schedule_profiles" 
    ("id", "userId", "timezone", "workingHoursStart", "workingHoursEnd", "bufferMinutes", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    up."userId",
    COALESCE(up."timezone", 'UTC') AS timezone,
    '09:00' AS workingHoursStart,
    '17:00' AS workingHoursEnd,
    15 AS bufferMinutes,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "user_preferences" up
WHERE NOT EXISTS (
    SELECT 1 FROM "user_schedule_profiles" usp WHERE usp."userId" = up."userId"
);

-- Now safe to drop the timezone column from user_preferences
ALTER TABLE "user_preferences" DROP COLUMN "timezone";