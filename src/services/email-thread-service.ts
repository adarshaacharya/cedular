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

interface CreateEmailMessageInput {
  emailThreadId: string;
  gmailMessageId: string;
  from: string;
  to: string[];
  cc?: string[];
  subject?: string;
  bodyText: string;
  bodyHtml?: string;
  snippet?: string;
  sentAt: Date;
}

export async function createEmailThread(input: CreateEmailThreadInput) {
  return await prisma.emailThread.upsert({
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

export async function saveEmailMessage(
  input: CreateEmailMessageInput
): Promise<void> {
  await prisma.emailMessage.upsert({
    where: { gmailMessageId: input.gmailMessageId },
    update: {
      from: input.from,
      to: input.to,
      cc: input.cc,
      subject: input.subject,
      bodyText: input.bodyText,
      bodyHtml: input.bodyHtml,
      snippet: input.snippet,
      sentAt: input.sentAt,
    },
    create: {
      emailThreadId: input.emailThreadId,
      gmailMessageId: input.gmailMessageId,
      from: input.from,
      to: input.to,
      cc: input.cc,
      subject: input.subject,
      bodyText: input.bodyText,
      bodyHtml: input.bodyHtml,
      snippet: input.snippet,
      sentAt: input.sentAt,
    },
  });
}

export async function saveEmailMessages(
  emailThreadId: string,
  messages: Array<{
    gmailMessageId: string;
    from: string;
    to: string[];
    cc?: string[];
    subject?: string;
    bodyText: string;
    bodyHtml?: string;
    snippet?: string;
    sentAt: Date;
  }>
): Promise<void> {
  const messagePromises = messages.map((message) =>
    saveEmailMessage({
      emailThreadId,
      ...message,
    })
  );

  await Promise.all(messagePromises);
}

export async function getEmailThreadWithMessages(
  threadId: string,
  userId: string
) {
  return await prisma.emailThread.findFirst({
    where: {
      threadId,
      userId,
    },
    include: {
      messages: {
        orderBy: {
          sentAt: "asc",
        },
      },
    },
  });
}
