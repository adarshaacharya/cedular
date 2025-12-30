-- CreateEnum
CREATE TYPE "MeetingSource" AS ENUM ('email_thread', 'chat_assistant');

-- AlterTable
ALTER TABLE "meetings" ADD COLUMN     "source" "MeetingSource" NOT NULL DEFAULT 'email_thread';
