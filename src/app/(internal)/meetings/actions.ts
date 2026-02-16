"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth/get-session";
import type { SearchParamsInput } from "@/lib/table-query/types";
import { queryMeetingsTable } from "./table-config";
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

export async function getMeetings(input?: SearchParamsInput) {
  const session = await getServerSession();

  if (!session?.user) {
    return { data: [], total: 0, pageCount: 1 };
  }

  return queryMeetingsTable({
    userId: session.user.id,
    input,
  });
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
