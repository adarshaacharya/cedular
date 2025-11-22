/**
 * Email Thread Service
 *
 * Handles creating and managing email thread records in the database
 */

import prisma from "@/lib/prisma";

interface CreateEmailThreadInput {
  userId: string;
  threadId: string;
  subject: string;
  participants: string[];
  intent: string;
  status?: "pending" | "processing" | "scheduled" | "failed" | "completed";
}

export async function createEmailThread(
  input: CreateEmailThreadInput
): Promise<void> {
  await prisma.emailThread.create({
    data: {
      userId: input.userId,
      threadId: input.threadId,
      subject: input.subject,
      participants: input.participants,
      intent: input.intent,
      status: input.status || "completed",
    },
  });
}

export async function getEmailThreadByThreadId(
  threadId: string,
  userId: string
) {
  return await prisma.emailThread.findFirst({
    where: {
      threadId,
      userId,
    },
  });
}

export async function updateEmailThreadStatus(
  threadId: string,
  userId: string,
  status: "pending" | "processing" | "scheduled" | "failed" | "completed"
): Promise<void> {
  await prisma.emailThread.updateMany({
    where: {
      threadId,
      userId,
    },
    data: {
      status,
    },
  });
}
