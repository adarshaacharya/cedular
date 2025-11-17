/**
 * Test setup for calendar agent evals
 *
 * Provides:
 * - Mock calendar data generation
 * - Test user setup in database
 * - Calendar events mocking
 */

import prisma from "@/lib/prisma";
import type { CalendarEvent } from "@/integrations/calendar/types";
import { addDays, setHours, setMinutes } from "date-fns";

const TEST_USER_ID = "eval-test-user";

/**
 * Generate mock calendar events for testing
 * Creates realistic busy/free slots
 */
export function generateMockCalendarEvents(
  participantEmail: string,
  daysAhead: number = 30
): CalendarEvent[] {
  const now = new Date();
  const events: CalendarEvent[] = [];

  // Create some sample busy events
  for (let i = 0; i < 5; i++) {
    const eventDate = addDays(now, Math.floor(Math.random() * daysAhead));
    const startHour = Math.floor(Math.random() * 8) + 9; // 9 AM - 5 PM
    const startTime = setMinutes(setHours(eventDate, startHour), 0);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

    events.push({
      id: `mock-event-${i}`,
      summary: `Sample Meeting ${i + 1}`,
      description: "Mock calendar event for testing",
      start: {
        dateTime: startTime.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: "UTC",
      },
      attendees: [
        {
          email: participantEmail,
          responseStatus: "accepted",
        },
      ],
      status: "confirmed",
    });
  }

  return events;
}

/**
 * Set up a test user with mock calendar credentials
 */
export async function setupTestUser(): Promise<string> {
  // Create or update test user (upsert handles both cases)
  await prisma.user.upsert({
    where: { id: TEST_USER_ID },
    update: {
      email: "eval-test@example.com",
      name: "Eval Test User",
    },
    create: {
      id: TEST_USER_ID,
      email: "eval-test@example.com",
      name: "Eval Test User",
    },
  });

  // Create or update user preferences with mock tokens
  const mockAccessToken = "mock-access-token-" + Date.now();
  const mockRefreshToken = "mock-refresh-token-" + Date.now();
  const tokenExpiry = new Date(Date.now() + 3600 * 1000); // 1 hour from now

  await prisma.userPreferences.upsert({
    where: { userId: TEST_USER_ID },
    update: {
      calendarAccessToken: mockAccessToken,
      calendarRefreshToken: mockRefreshToken,
      calendarTokenExpiry: tokenExpiry,
      timezone: "UTC",
    },
    create: {
      userId: TEST_USER_ID,
      calendarAccessToken: mockAccessToken,
      calendarRefreshToken: mockRefreshToken,
      calendarTokenExpiry: tokenExpiry,
      timezone: "UTC",
    },
  });

  return TEST_USER_ID;
}

/**
 * Clean up test data
 */
export async function cleanupTestUser(): Promise<void> {
  await prisma.userPreferences.deleteMany({
    where: { userId: TEST_USER_ID },
  });

  await prisma.user.deleteMany({
    where: { id: TEST_USER_ID },
  });
}

export { TEST_USER_ID };
