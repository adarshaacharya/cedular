import prisma from "@/lib/prisma";
import { fetchEmailThread } from "@/integrations/gmail";
import { extractEmailAddresses } from "@/integrations/gmail/utils";
import { saveEmailMessages } from "@/services/email-thread-service";

/**
 * Sync a Gmail thread's messages into the DB (idempotent upserts by gmailMessageId).
 *
 * This is the scalable "source of truth = Gmail" approach:
 * - after sending an email, call this to ensure the outgoing message is persisted
 * - after receiving a webhook/history event, call this to persist the latest inbound message(s)
 */
export async function syncGmailThreadMessagesToDb(args: {
  userId: string;
  threadId: string;
  emailThreadDbId?: string;
}): Promise<void> {
  const { userId, threadId } = args;

  const parsed = await fetchEmailThread(threadId, userId);

  // Resolve the DB thread id if not provided.
  let emailThreadDbId = args.emailThreadDbId;
  if (!emailThreadDbId) {
    const dbThread = await prisma.emailThread.findFirst({
      where: { threadId, userId },
      select: { id: true },
    });
    emailThreadDbId = dbThread?.id;
  }

  if (!emailThreadDbId) {
    // If we don't have a DB thread record yet, there's nowhere to store messages.
    // Callers should create the EmailThread first (schedule handler does).
    return;
  }

  const messagesToSave = parsed.messages.map((msg) => ({
    gmailMessageId: msg.id,
    from: msg.from,
    to: extractEmailAddresses(msg.to || ""),
    cc: extractEmailAddresses(msg.cc || ""),
    subject: msg.subject,
    body: msg.body,
    bodyText: msg.bodyText,
    bodyHtml: msg.bodyHtml,
    snippet: msg.snippet || undefined,
    sentAt: msg.sentAt,
  }));

  await saveEmailMessages(emailThreadDbId, messagesToSave);
}

