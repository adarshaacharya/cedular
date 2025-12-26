/**
 * Email Thread Service
 *
 * Handles creating and managing email thread records in the database
 */

import prisma from "@/lib/prisma";
import {
  EmailThreadIntent,
  EmailThreadStatus,
} from "@/prisma/generated/prisma/enums";

interface CreateEmailThreadInput {
  userId: string;
  threadId: string;
  subject: string;
  participants: string[];
  intent: EmailThreadIntent;
  status?: EmailThreadStatus;
  proposedSlots?: Array<{ start: string; end: string; score?: number }>;
}

export async function createEmailThread(
  input: CreateEmailThreadInput
): Promise<void> {
  await prisma.emailThread.upsert({
    where: { threadId: input.threadId },
    update: {
      subject: input.subject,
      participants: input.participants,
      intent: input.intent,
      status: input.status || EmailThreadStatus.awaiting_confirmation,
      proposedSlots: input.proposedSlots,
    },
    create: {
      userId: input.userId,
      threadId: input.threadId,
      subject: input.subject,
      participants: input.participants,
      intent: input.intent,
      status: input.status || EmailThreadStatus.awaiting_confirmation,
      proposedSlots: input.proposedSlots,
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
  status: EmailThreadStatus
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
