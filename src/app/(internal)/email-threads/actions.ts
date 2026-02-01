"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth/get-session";

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
