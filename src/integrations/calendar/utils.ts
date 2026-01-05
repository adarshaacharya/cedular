/**
 * Calendar utility functions
 */

import { google } from "googleapis";
import { env } from "@/env";

/**
 * Create OAuth2 client with credentials
 */
export function createOAuth2Client() {
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_SERVICES_REDIRECT_URI
  );
}

/**
 * Format date for Calendar API
 */
export function formatDateTime(date: Date, timeZone: string): string {
  return date.toISOString();
}

/**
 * Check if event overlaps with time range
 */
export function isEventInRange(
  event: {
    start?: { dateTime?: string | null; date?: string | null };
    end?: { dateTime?: string | null; date?: string | null };
  },
  timeMin: Date,
  timeMax: Date
): boolean {
  if (!event.start || !event.end) return false;

  const eventStart = event.start.dateTime
    ? new Date(event.start.dateTime)
    : event.start.date
    ? new Date(event.start.date)
    : null;
  const eventEnd = event.end.dateTime
    ? new Date(event.end.dateTime)
    : event.end.date
    ? new Date(event.end.date)
    : null;

  if (!eventStart || !eventEnd) return false;

  // Event overlaps if it starts before timeMax and ends after timeMin
  return eventStart < timeMax && eventEnd > timeMin;
}

/**
 * Extract attendee emails from event
 */
export function extractAttendeeEmails(
  attendees?: Array<{ email?: string | null }>
): string[] {
  if (!attendees) return [];
  return attendees
    .map((a) => a.email)
    .filter((email): email is string => Boolean(email));
}

