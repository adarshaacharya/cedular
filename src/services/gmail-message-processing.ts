import prisma from "@/lib/prisma";

export const DEFAULT_MAX_MESSAGE_ATTEMPTS = 5;

export type BeginProcessingResult =
  | { action: "skip_processed" }
  | { action: "skip_dead" }
  | { action: "deadletter"; attempts: number; lastError?: string | null }
  | { action: "process"; attempts: number };

export async function beginGmailMessageProcessing({
  userId,
  gmailMessageId,
  threadId,
  maxAttempts = DEFAULT_MAX_MESSAGE_ATTEMPTS,
}: {
  userId: string;
  gmailMessageId: string;
  threadId: string;
  maxAttempts?: number;
}): Promise<BeginProcessingResult> {
  const existing = await prisma.gmailMessageProcessing.findUnique({
    where: { userId_gmailMessageId: { userId, gmailMessageId } },
  });

  if (existing?.status === "processed") return { action: "skip_processed" };
  if (existing?.status === "dead") return { action: "skip_dead" };

  const nextAttempts = (existing?.attempts || 0) + 1;

  if (nextAttempts > maxAttempts) {
    await prisma.gmailMessageProcessing.upsert({
      where: { userId_gmailMessageId: { userId, gmailMessageId } },
      update: {
        threadId,
        status: "dead",
        attempts: nextAttempts,
        lastAttemptAt: new Date(),
      },
      create: {
        userId,
        gmailMessageId,
        threadId,
        status: "dead",
        attempts: nextAttempts,
        lastAttemptAt: new Date(),
      },
    });

    return {
      action: "deadletter",
      attempts: nextAttempts,
      lastError: existing?.lastError ?? null,
    };
  }

  await prisma.gmailMessageProcessing.upsert({
    where: { userId_gmailMessageId: { userId, gmailMessageId } },
    update: {
      threadId,
      status: "pending",
      attempts: nextAttempts,
      lastAttemptAt: new Date(),
    },
    create: {
      userId,
      gmailMessageId,
      threadId,
      status: "pending",
      attempts: nextAttempts,
      lastAttemptAt: new Date(),
    },
  });

  return { action: "process", attempts: nextAttempts };
}

export async function markGmailMessageProcessed({
  userId,
  gmailMessageId,
}: {
  userId: string;
  gmailMessageId: string;
}) {
  await prisma.gmailMessageProcessing.update({
    where: { userId_gmailMessageId: { userId, gmailMessageId } },
    data: { status: "processed", lastError: null },
  });
}

export async function markGmailMessageFailed({
  userId,
  gmailMessageId,
  error,
}: {
  userId: string;
  gmailMessageId: string;
  error: string;
}) {
  await prisma.gmailMessageProcessing.update({
    where: { userId_gmailMessageId: { userId, gmailMessageId } },
    data: { status: "failed", lastError: error || "Unknown error" },
  });
}

