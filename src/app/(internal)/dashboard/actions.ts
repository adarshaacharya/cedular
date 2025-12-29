"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth/get-session";
import { startOfWeek, endOfWeek, startOfDay, endOfDay } from "date-fns";

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
    return 0;
  }

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 0 }); // Sunday
  const weekEnd = endOfWeek(now, { weekStartsOn: 0 }); // Saturday

  const count = await prisma.meeting.count({
    where: {
      userId: session.user.id,
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

/**
 * Get count of meetings scheduled for today
 */
export async function getTodayMeetingsCount() {
  const session = await getServerSession();

  if (!session?.user) {
    return 0;
  }

  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  const count = await prisma.meeting.count({
    where: {
      userId: session.user.id,
      status: {
        in: ["confirmed", "proposed"],
      },
      startTime: {
        gte: dayStart,
        lte: dayEnd,
      },
    },
  });

  return count;
}

/**
 * Get last 5 email threads with basic information
 */
export async function getRecentThreads() {
  const session = await getServerSession();

  if (!session?.user) {
    return [];
  }

  const threads = await prisma.emailThread.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
      subject: true,
      participants: true,
      status: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  return threads;
}
/**
 * Get next 3 upcoming confirmed meetings
 */
export async function getUpcomingMeetings() {
  const session = await getServerSession();

  if (!session?.user) {
    return [];
  }

  const now = new Date();

  const meetings = await prisma.meeting.findMany({
    where: {
      userId: session.user.id,
      status: "confirmed",
      startTime: {
        gte: now,
      },
    },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      participants: true,
      meetingLink: true,
    },
    orderBy: {
      startTime: "asc",
    },
    take: 3,
  });

  return meetings.map((meeting) => ({
    id: meeting.id,
    title: meeting.title,
    time: meeting.startTime,
    participants: meeting.participants.length,
    meetingLink: meeting.meetingLink,
  }));
}

/**
 * Get the next upcoming confirmed meeting with full details
 */
export async function getNextMeeting() {
  const session = await getServerSession();

  if (!session?.user) {
    return null;
  }

  const now = new Date();

  const meeting = await prisma.meeting.findFirst({
    where: {
      userId: session.user.id,
      status: "confirmed",
      startTime: {
        gte: now,
      },
    },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      description: true,
      participants: true,
      meetingLink: true,
    },
    orderBy: {
      startTime: "asc",
    },
  });

  if (!meeting) {
    return null;
  }

  return {
    id: meeting.id,
    title: meeting.title,
    startTime: meeting.startTime,
    endTime: meeting.endTime,
    description: meeting.description,
    participants: meeting.participants,
    meetingLink: meeting.meetingLink,
  };
}
