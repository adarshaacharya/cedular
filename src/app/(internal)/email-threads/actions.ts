"use server";

import { cache } from "react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Cache the session lookup for request deduplication
const getCachedSession = cache(async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
});

export async function getEmailThreads() {
  const session = await getCachedSession();

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
  const session = await getCachedSession();

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
