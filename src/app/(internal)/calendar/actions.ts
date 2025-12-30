"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth/get-session";

export type CalendarMeeting = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  participants: number;
  meetingLink: string | null;
  status: string;
  description: string | null;
};

/**
 * Get all meetings for a specific month
 * Returns meetings grouped by date for calendar display
 */
export async function getMeetingsForMonth(year: number, month: number) {
  const session = await getServerSession();

  if (!session?.user) {
    return {};
  }

  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const meetings = await prisma.meeting.findMany({
    where: {
      userId: session.user.id,
      status: {
        in: ["confirmed", "proposed"],
      },
      startTime: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      participants: true,
      meetingLink: true,
      status: true,
      description: true,
    },
    orderBy: {
      startTime: "asc",
    },
  });

  // Group meetings by date (YYYY-MM-DD)
  const meetingsByDate: Record<string, CalendarMeeting[]> = {};
  
  meetings.forEach((meeting) => {
    const dateKey = meeting.startTime.toISOString().split("T")[0];
    if (!meetingsByDate[dateKey]) {
      meetingsByDate[dateKey] = [];
    }
    meetingsByDate[dateKey].push({
      id: meeting.id,
      title: meeting.title,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      participants: meeting.participants.length,
      meetingLink: meeting.meetingLink,
      status: meeting.status,
      description: meeting.description,
    });
  });

  return meetingsByDate;
}
