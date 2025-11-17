"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth/get-session";


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
    take: 20, // Limit to recent 20 threads
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
