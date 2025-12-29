/**
 * Meetings Service
 *
 * Handles creating and managing meeting records in the database
 */

import prisma from "@/lib/prisma";
import { MeetingStatus } from "@/prisma/generated/prisma/enums";
import type { CalendarEvent } from "@/integrations/calendar/types";
import type { Meeting } from "@/prisma/generated/prisma/client";

interface CreateMeetingFromCalendarInput {
  calendarEvent: CalendarEvent;
  userId: string;
  status?: MeetingStatus;
}

interface CreateMeetingFromEmailThreadInput {
  emailThreadId: string;
  title: string;
  description?: string;
  participants: string[];
  startTime: Date;
  endTime: Date;
  timezone: string;
  calendarEventId?: string;
  status?: MeetingStatus;
}

/**
 * Creates a meeting record from a calendar event (standalone - no email thread)
 */
export async function createMeetingFromCalendarEvent(
  input: CreateMeetingFromCalendarInput
): Promise<Meeting> {
  const { calendarEvent, userId, status = MeetingStatus.confirmed } = input;

  // Check for duplicate
  const existingMeeting = await prisma.meeting.findFirst({
    where: { calendarEventId: calendarEvent.id! },
  });

  if (existingMeeting) {
    return existingMeeting;
  }

  // Extract participants from calendar event
  const participants =
    calendarEvent.attendees?.filter((a) => a.email)?.map((a) => a.email!) || [];

  // Create meeting WITHOUT email thread (standalone calendar event)
  return prisma.meeting.create({
    data: {
      userId,
      title: calendarEvent.summary || "Calendar Event",
      description: calendarEvent.description || null,
      participants,
      startTime: new Date(calendarEvent.start!.dateTime!),
      endTime: new Date(calendarEvent.end!.dateTime!),
      timezone: calendarEvent.start!.timeZone || "UTC",
      calendarEventId: calendarEvent.id,
      status,
    },
  });
}

/**
 * Creates a meeting record linked to an email thread (email-scheduled meetings)
 */
export async function createMeetingFromEmailThread(
  input: CreateMeetingFromEmailThreadInput
): Promise<Meeting> {
  const {
    emailThreadId,
    title,
    description,
    participants,
    startTime,
    endTime,
    timezone,
    calendarEventId,
    status = MeetingStatus.confirmed,
  } = input;

  return prisma.meeting.create({
    data: {
      emailThreadId,
      userId: await getUserIdFromEmailThread(emailThreadId), // Auto-populate from thread
      title,
      description,
      participants,
      startTime,
      endTime,
      timezone,
      calendarEventId,
      status,
    },
  });
}

/**
 * Helper function to get userId from email thread
 */
async function getUserIdFromEmailThread(
  emailThreadId: string
): Promise<string> {
  const emailThread = await prisma.emailThread.findUnique({
    where: { id: emailThreadId },
    select: { userId: true },
  });

  if (!emailThread) {
    throw new Error(`Email thread ${emailThreadId} not found`);
  }

  return emailThread.userId;
}
