"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth/get-session";
import { EmailThreadStatus } from "@/prisma/generated/prisma/enums";

export async function getEmailThreadById(id: string) {
  const session = await getServerSession();

  if (!session?.user) {
    return null;
  }

  return await fetchEmailThreadById(id, session.user.id);
}

async function fetchEmailThreadById(id: string, userId: string) {
  "use cache";

  const thread = await prisma.emailThread.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      meetings: {
        orderBy: {
          createdAt: "desc",
        },
      },
      messages: {
        orderBy: {
          sentAt: "asc",
        },
      },
    },
  });

  return thread;
}

export async function getEmailThreads() {
  const session = await getServerSession();

  if (!session?.user) {
    return [];
  }

  const threads = await prisma.emailThread.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10, // Limit to recent 10 threads
  });

  return threads;
}

export async function getEmailThreadsStats() {
  const session = await getServerSession();

  if (!session?.user) {
    return {
      total: 0,
      pending: 0,
      processing: 0,
      scheduled: 0,
      awaitingConfirmation: 0,
      confirmed: 0,
      failed: 0,
    };
  }

  const [
    total,
    pending,
    processing,
    scheduled,
    awaitingConfirmation,
    confirmed,
    failed,
  ] = await Promise.all([
    prisma.emailThread.count({
      where: { userId: session.user.id },
    }),
    prisma.emailThread.count({
      where: {
        userId: session.user.id,
        status: EmailThreadStatus.pending,
      },
    }),
    prisma.emailThread.count({
      where: {
        userId: session.user.id,
        status: EmailThreadStatus.processing,
      },
    }),
    prisma.emailThread.count({
      where: {
        userId: session.user.id,
        status: EmailThreadStatus.scheduled,
      },
    }),
    prisma.emailThread.count({
      where: {
        userId: session.user.id,
        status: EmailThreadStatus.awaiting_confirmation,
      },
    }),
    prisma.emailThread.count({
      where: {
        userId: session.user.id,
        status: EmailThreadStatus.confirmed,
      },
    }),
    prisma.emailThread.count({
      where: {
        userId: session.user.id,
        status: EmailThreadStatus.failed,
      },
    }),
  ]);

  return {
    total,
    pending,
    processing,
    scheduled,
    awaitingConfirmation,
    confirmed,
    failed,
  };
}

export async function getPendingThreadsCount() {
  const session = await getServerSession();

  if (!session?.user) {
    return 0;
  }

  const count = await prisma.emailThread.count({
    where: {
      userId: session.user.id,
      status: "pending",
    },
  });

  return count;
}
