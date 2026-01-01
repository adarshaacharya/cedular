"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth/get-session";
import type { MeetingStatus } from "@/prisma/generated/prisma/enums";

export async function getMeetingById(id: string) {
  const session = await getServerSession();

  if (!session?.user) {
    return null;
  }

  const meeting = await prisma.meeting.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      emailThread: {
        select: {
          id: true,
          subject: true,
          threadId: true,
          status: true,
          intent: true,
          participants: true,
          createdAt: true,
        },
      },
    },
  });

  return meeting;
}

export async function getMeetings() {
  const session = await getServerSession();

  if (!session?.user) {
    return [];
  }

  const meetings = await prisma.meeting.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      emailThread: {
        select: {
          id: true,
          subject: true,
          threadId: true,
          status: true,
          intent: true,
          participants: true,
          createdAt: true,
        },
      },
    },
    orderBy: [
      {
        startTime: "asc",
      },
    ],
  });

  return meetings;
}

export async function getMeetingsCount() {
  const session = await getServerSession();

  if (!session?.user) {
    return { total: 0, confirmed: 0, proposed: 0, cancelled: 0 };
  }

  const [total, confirmed, proposed, cancelled] = await Promise.all([
    prisma.meeting.count({
      where: {
        userId: session.user.id,
      },
    }),
    prisma.meeting.count({
      where: {
        userId: session.user.id,
        status: "confirmed",
      },
    }),
    prisma.meeting.count({
      where: {
        userId: session.user.id,
        status: "proposed",
      },
    }),
    prisma.meeting.count({
      where: {
        userId: session.user.id,
        status: "cancelled",
      },
    }),
  ]);

  return { total, confirmed, proposed, cancelled };
}

export async function updateMeetingStatus(
  meetingId: string,
  status: MeetingStatus
) {
  const session = await getServerSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verify the meeting belongs to the user
  const meeting = await prisma.meeting.findFirst({
    where: {
      id: meetingId,
      userId: session.user.id,
    },
  });

  if (!meeting) {
    throw new Error("Meeting not found");
  }

  const updated = await prisma.meeting.update({
    where: { id: meetingId },
    data: { status },
  });

  return updated;
}
