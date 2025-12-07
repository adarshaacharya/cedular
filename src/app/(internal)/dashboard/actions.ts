"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth/get-session";
import { startOfWeek, endOfWeek } from "date-fns";

/**
 * Check if user has Google (Gmail/Calendar) connected
 */
export async function getGoogleConnectionStatus() {
  const session = await getServerSession();

  if (!session?.user) {
    return {
      connected: false,
      email: null,
    };
  }

  const preferences = await prisma.userPreferences.findUnique({
    where: {
      userId: session.user.id,
    },
    select: {
      gmailAccessToken: true,
      gmailRefreshToken: true,
      assistantEmail: true,
    },
  });

  return {
    connected: Boolean(
      preferences?.gmailAccessToken && preferences?.gmailRefreshToken
    ),
    email: preferences?.assistantEmail,
  };
}

/**
 * Get count of confirmed meetings scheduled for this week
 */
export async function getMeetingsThisWeekCount() {
  const session = await getServerSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 0 }); // Sunday
  const weekEnd = endOfWeek(now, { weekStartsOn: 0 }); // Saturday

  const count = await prisma.meeting.count({
    where: {
      emailThread: {
        userId: session.user.id,
      },
      status: {
        in: ["confirmed", "proposed"], // Include both confirmed and proposed meetings
      },
      startTime: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
  });

  return count;
}

/**
 * Calculate average response time in hours for completed threads
 * (time from creation to first status change from 'pending')
 */
export async function getAverageResponseTime() {
  const session = await getServerSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Get threads that have moved beyond pending status
  const threads = await prisma.emailThread.findMany({
    where: {
      userId: session.user.id,
      status: {
        not: "pending",
      },
    },
    select: {
      createdAt: true,
      updatedAt: true,
    },
    take: 50, // Sample of recent 50 threads
  });

  if (threads.length === 0) {
    return null;
  }

  // Calculate average time difference in hours
  const totalHours = threads.reduce((sum, thread) => {
    const diff = thread.updatedAt.getTime() - thread.createdAt.getTime();
    const hours = diff / (1000 * 60 * 60);
    return sum + hours;
  }, 0);

  const avgHours = totalHours / threads.length;

  // Format response time nicely
  if (avgHours < 1) {
    return `${Math.round(avgHours * 60)}m`;
  } else if (avgHours < 24) {
    return `${avgHours.toFixed(1)}h`;
  } else {
    return `${(avgHours / 24).toFixed(1)}d`;
  }
}

/**
 * Calculate success rate (percentage of threads that reached confirmed status)
 */
export async function getSuccessRate() {
  const session = await getServerSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const [totalThreads, confirmedThreads] = await Promise.all([
    prisma.emailThread.count({
      where: {
        userId: session.user.id,
        status: {
          not: "pending", // Only count threads that have been processed
        },
      },
    }),
    prisma.emailThread.count({
      where: {
        userId: session.user.id,
        status: "confirmed",
      },
    }),
  ]);

  if (totalThreads === 0) {
    return null;
  }

  const rate = (confirmedThreads / totalThreads) * 100;
  return `${Math.round(rate)}%`;
}

export async function getPendingRequestsCount() {
  const session = await getServerSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return prisma.emailThread.count({
    where: {
      userId: session.user.id,
      status: "pending",
    },
  });
}
