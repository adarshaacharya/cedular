/**
 * Mock calendar integration for testing
 *
 * Replaces actual Google Calendar API calls with mock data
 * This allows evals to run without real OAuth credentials
 */

import type { CalendarEvent } from "@/integrations/calendar/types";
import { generateMockCalendarEvents } from "../_lib/test-setup";

// Cache for mock calendar data per participant
const mockCalendarCache = new Map<string, CalendarEvent[]>();

/**
 * Get mock calendar events (replaces real getCalendarEvents)
 */
export async function getMockCalendarEvents({
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
  const cacheKey = `${userId}-${attendeeEmail}`;

  // Return cached mock events if available
  if (mockCalendarCache.has(cacheKey)) {
    return mockCalendarCache.get(cacheKey)!;
  }

  // Generate new mock events for this participant
  const mockEvents = generateMockCalendarEvents(
    attendeeEmail,
    Math.ceil((timeMax.getTime() - timeMin.getTime()) / (1000 * 60 * 60 * 24))
  );

  // Filter events within the requested time range
  const filteredEvents = mockEvents.filter((event) => {
    if (!event.start?.dateTime) return false;
    const eventStart = new Date(event.start.dateTime);
    return eventStart >= timeMin && eventStart <= timeMax;
  });

  mockCalendarCache.set(cacheKey, filteredEvents);
  return filteredEvents;
}

/**
 * Clear the mock calendar cache
 */
export function clearMockCalendarCache(): void {
  mockCalendarCache.clear();
}
