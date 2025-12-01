/**
 * Google Calendar API Integration
 *
 * Provides functions to interact with Google Calendar API:
 * - Fetch calendar events
 * - Create calendar events
 * - Update calendar events
 * - Delete calendar events
 */

import { PRIMARY_CALENDAR_ID } from "./constants";
import { getCalendarClient } from "./_lib/auth";
import { extractAttendeeEmails } from "./utils";
import type {
  CalendarEvent,
  CreateEventInput,
  UpdateEventInput,
  CalendarEventList,
} from "./types";

/**
 * Get calendar events for a specific attendee email within a time range
 */
export async function getCalendarEvents({
  attendeeEmail,
  userId,
  timeMin,
  timeMax,
}: {
  attendeeEmail: string;
  userId: string;
  timeMin: Date;
  timeMax: Date;
}): Promise<CalendarEvent[]> {
  const calendar = await getCalendarClient(userId);

  try {
    const response = await calendar.events.list({
      calendarId: PRIMARY_CALENDAR_ID,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 2500, // Maximum allowed by API
    });

    const allEvents = response.data.items || [];

    // Filter events where the attendee is a participant
    const attendeeEvents = allEvents.filter((event) => {
      const attendees = extractAttendeeEmails(event.attendees);
      return (
        attendees.includes(attendeeEmail) ||
        event.attendees?.some(
          (a) => a.email?.toLowerCase() === attendeeEmail.toLowerCase()
        )
      );
    });

    return attendeeEvents as CalendarEvent[];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get calendar events: ${errorMessage}`);
  }
}

/**
 * Get all calendar events for a user within a time range
 */
export async function getUserCalendarEvents(
  userId: string,
  timeMin: Date,
  timeMax: Date
): Promise<CalendarEventList> {
  const calendar = await getCalendarClient(userId);

  try {
    const response = await calendar.events.list({
      calendarId: PRIMARY_CALENDAR_ID,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 2500,
    });

    return {
      items: (response.data.items || []) as CalendarEvent[],
      nextPageToken: response.data.nextPageToken || undefined,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get user calendar events: ${errorMessage}`);
  }
}

/**
 * Create a calendar event
 */
export async function createCalendarEvent(
  event: CreateEventInput,
  userId: string
): Promise<CalendarEvent> {
  const calendar = await getCalendarClient(userId);

  try {
    const response = await calendar.events.insert({
      calendarId: PRIMARY_CALENDAR_ID,
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: {
          dateTime: event.start.dateTime,
          timeZone: event.start.timeZone,
        },
        end: {
          dateTime: event.end.dateTime,
          timeZone: event.end.timeZone,
        },
        attendees: event.attendees?.map((a) => ({
          email: a.email,
          displayName: a.displayName,
        })),
        location: event.location,
        conferenceData: event.conferenceData,
      },
      conferenceDataVersion: event.conferenceData ? 1 : 0,
    });

    return response.data as CalendarEvent;
  } catch (error: unknown) {
    // Log full error details for debugging
    console.error("[Calendar] createCalendarEvent failed:", {
      event: {
        summary: event.summary,
        start: event.start,
        end: event.end,
        attendees: event.attendees,
      },
      error,
    });

    // Try to extract Google API error details
    const gError = error as {
      response?: {
        data?: { error?: { message?: string; errors?: unknown[] } };
      };
    };
    const apiError = gError?.response?.data?.error;
    const errorMessage =
      apiError?.message ||
      (error instanceof Error ? error.message : String(error));
    const errorDetails = apiError?.errors
      ? JSON.stringify(apiError.errors)
      : "";

    throw new Error(
      `Failed to create calendar event: ${errorMessage}${
        errorDetails ? ` - Details: ${errorDetails}` : ""
      }`
    );
  }
}

/**
 * Update a calendar event
 */
export async function updateCalendarEvent(
  eventId: string,
  updates: UpdateEventInput,
  userId: string
): Promise<CalendarEvent> {
  const calendar = await getCalendarClient(userId);

  try {
    // First, get the existing event
    const existingEvent = await calendar.events.get({
      calendarId: PRIMARY_CALENDAR_ID,
      eventId,
    });

    // Merge updates with existing event
    // Filter out null values and only include defined fields
    const requestBody: {
      summary?: string;
      description?: string;
      start?: { dateTime: string; timeZone: string };
      end?: { dateTime: string; timeZone: string };
      attendees?: Array<{ email: string; displayName?: string }>;
      location?: string;
      status?: string;
    } = {
      ...(existingEvent.data.summary && {
        summary: existingEvent.data.summary,
      }),
      ...(existingEvent.data.description && {
        description: existingEvent.data.description,
      }),
      ...(existingEvent.data.start?.dateTime &&
        existingEvent.data.start?.timeZone && {
          start: {
            dateTime: existingEvent.data.start.dateTime,
            timeZone: existingEvent.data.start.timeZone,
          },
        }),
      ...(existingEvent.data.end?.dateTime &&
        existingEvent.data.end?.timeZone && {
          end: {
            dateTime: existingEvent.data.end.dateTime,
            timeZone: existingEvent.data.end.timeZone,
          },
        }),
      ...(existingEvent.data.attendees && {
        attendees: existingEvent.data.attendees
          .filter((a): a is { email: string; displayName?: string } =>
            Boolean(a.email)
          )
          .map((a) => ({
            email: a.email!,
            displayName: a.displayName || undefined,
          })),
      }),
      ...(existingEvent.data.location && {
        location: existingEvent.data.location,
      }),
      ...(existingEvent.data.status && { status: existingEvent.data.status }),
      // Apply updates (overrides existing values)
      ...(updates.summary && { summary: updates.summary }),
      ...(updates.description !== undefined && {
        description: updates.description,
      }),
      ...(updates.start && {
        start: {
          dateTime: updates.start.dateTime,
          timeZone: updates.start.timeZone,
        },
      }),
      ...(updates.end && {
        end: {
          dateTime: updates.end.dateTime,
          timeZone: updates.end.timeZone,
        },
      }),
      ...(updates.attendees && {
        attendees: updates.attendees.map((a) => ({
          email: a.email,
          displayName: a.displayName,
        })),
      }),
      ...(updates.location !== undefined && { location: updates.location }),
      ...(updates.status && { status: updates.status }),
    };

    const response = await calendar.events.update({
      calendarId: PRIMARY_CALENDAR_ID,
      eventId,
      requestBody,
    });

    return response.data as CalendarEvent;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to update calendar event: ${errorMessage}`);
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(
  eventId: string,
  userId: string
): Promise<void> {
  const calendar = await getCalendarClient(userId);

  try {
    await calendar.events.delete({
      calendarId: PRIMARY_CALENDAR_ID,
      eventId,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to delete calendar event: ${errorMessage}`);
  }
}

/**
 * Get a specific calendar event by ID
 */
export async function getCalendarEvent(
  eventId: string,
  userId: string
): Promise<CalendarEvent> {
  const calendar = await getCalendarClient(userId);

  try {
    const response = await calendar.events.get({
      calendarId: PRIMARY_CALENDAR_ID,
      eventId,
    });

    return response.data as CalendarEvent;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get calendar event: ${errorMessage}`);
  }
}

// Re-export auth functions
export { getCalendarClient, refreshCalendarToken } from "./_lib/auth";
