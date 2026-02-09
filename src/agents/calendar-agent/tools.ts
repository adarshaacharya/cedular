/**
 * Calendar Agent Tools
 * These are the functions the agent can call autonomously
 */

import { tool } from "ai";
import { z } from "zod";
import {
  getCalendarEvents,
  getUserCalendarEvents,
} from "@/integrations/calendar";
import {
  addDays,
  addMinutes,
  parseISO,
} from "date-fns";
import {
  formatRFC3339WithOffset,
  getWeekdayIndex,
  getZonedParts,
  zonedPartsToUtc,
} from "@/lib/timezone";

export const calendarTools = {
  getUserCalendarEvents: tool({
    description:
      "Fetch the assistant's calendar events to find busy periods. Use this to get all events from the assistant's calendar.",
    inputSchema: z.object({
      userId: z.string().describe("User ID making the request"),
      daysAhead: z.number().default(7).describe("Number of days to look ahead"),
    }),
    execute: async ({ userId, daysAhead }) => {
      const timeMin = new Date();
      const timeMax = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);

      const result = await getUserCalendarEvents(userId, timeMin, timeMax);
      const events = result.items;

      // Convert events to busy periods format
      const busyPeriods = events
        .filter((event) => event.start?.dateTime && event.end?.dateTime)
        .map((event) => ({
          start: event.start!.dateTime!,
          end: event.end!.dateTime!,
          summary: event.summary || "Busy",
        }));

      return {
        busyPeriods,
        count: busyPeriods.length,
        message: `Found ${busyPeriods.length} busy periods in assistant's calendar`,
      };
    },
  }),

  getCalendarEvents: tool({
    description:
      "Fetch calendar events for a specific participant within a date range",
    inputSchema: z.object({
      email: z.string().email().describe("Participant's email address"),
      userId: z.string().describe("User ID making the request"),
      daysAhead: z.number().default(7).describe("Number of days to look ahead"),
    }),
    execute: async ({ email, userId, daysAhead }) => {
      const timeMin = new Date();
      const timeMax = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);

      const events = await getCalendarEvents({
        attendeeEmail: email,
        userId,
        timeMin,
        timeMax,
      });

      return {
        email,
        events,
        count: events.length,
      };
    },
  }),

  findFreeSlots: tool({
    description:
      "Find free time slots given busy periods and constraints. If no slots found, try expanding workingHoursStart/End (e.g., 08:00-18:00) or increasing daysToCheck (e.g., 14 days)",
    inputSchema: z.object({
      busyPeriods: z
        .array(
          z.object({
            start: z.string(),
            end: z.string(),
          })
        )
        .describe("Array of busy time periods in ISO 8601 format"),
      duration: z.number().describe("Meeting duration in minutes"),
      bufferMinutes: z
        .number()
        .default(0)
        .describe(
          "Extra buffer around busy events in minutes (e.g., 15 means avoid 15 minutes before/after existing events)"
        ),
      workingHoursStart: z
        .string()
        .default("09:00")
        .describe(
          "Start of working hours (HH:mm). Can expand to 08:00 or 07:00 if needed"
        ),
      workingHoursEnd: z
        .string()
        .default("17:00")
        .describe(
          "End of working hours (HH:mm). Can expand to 18:00 or 19:00 if needed"
        ),
      timezone: z
        .string()
        .default("UTC")
        .describe(
          "IANA timezone for working hours and returned slots (e.g., Asia/Kathmandu)"
        ),
      startDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .describe(
          "Optional anchor date (YYYY-MM-DD) in the given timezone to start searching from (defaults to today if omitted)"
        ),
      daysToCheck: z
        .number()
        .default(7)
        .describe(
          "Number of days to search (default 7, try 14 if no slots found)"
        ),
    }),
    execute: async ({
      busyPeriods,
      duration,
      bufferMinutes,
      workingHoursStart,
      workingHoursEnd,
      timezone,
      startDate,
      daysToCheck,
    }) => {
      const freeSlots: Array<{ start: string; end: string }> = [];
      const [startHour, startMinute] = workingHoursStart.split(":").map(Number);
      const [endHour, endMinute] = workingHoursEnd.split(":").map(Number);
      const buffer = Math.max(0, Math.floor(bufferMinutes || 0));

      // Parse busy periods
      const busyIntervals = busyPeriods.map((period) => ({
        // Apply buffer around busy events to avoid back-to-back scheduling.
        start: addMinutes(parseISO(period.start), -buffer),
        end: addMinutes(parseISO(period.end), buffer),
      }));

      // Work in the user's timezone, but compare conflicts in UTC instants.
      const now = new Date();
      let baseDay: Date;
      if (startDate) {
        const [y, m, d] = startDate.split("-").map(Number);
        // Use a UTC date as a convenient day counter; we only use its UTC Y-M-D.
        baseDay = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
      } else {
        const today = getZonedParts(now, timezone);
        // Use a UTC date as a convenient day counter; we only use its UTC Y-M-D.
        baseDay = new Date(
          Date.UTC(today.year, today.month - 1, today.day, 0, 0, 0)
        );
      }

      const hasOverlap = (slotStart: Date, slotEnd: Date) =>
        busyIntervals.some((b) => slotStart < b.end && slotEnd > b.start);

      // Check each day
      for (let dayOffset = 0; dayOffset < daysToCheck; dayOffset++) {
        const day = addDays(baseDay, dayOffset);
        const year = day.getUTCFullYear();
        const month = day.getUTCMonth() + 1;
        const dayOfMonth = day.getUTCDate();

        // Iterate through the day in 30-minute increments
        for (
          let minutes = startHour * 60 + startMinute;
          minutes + duration <= endHour * 60 + endMinute;
          minutes += 30
        ) {
          const startParts = {
            year,
            month,
            day: dayOfMonth,
            hour: Math.floor(minutes / 60),
            minute: minutes % 60,
            second: 0,
          };
          const slotStartUtc = zonedPartsToUtc(startParts, timezone);
          const slotEndUtc = addMinutes(slotStartUtc, duration);

          // Don't propose slots in the past.
          if (slotStartUtc.getTime() <= now.getTime()) continue;

          if (!hasOverlap(slotStartUtc, slotEndUtc)) {
            freeSlots.push({
              start: formatRFC3339WithOffset(slotStartUtc, timezone),
              end: formatRFC3339WithOffset(slotEndUtc, timezone),
            });
          }
        }
      }

      return {
        freeSlots: freeSlots.slice(0, 10), // Return max 10 slots
        count: freeSlots.length,
        message: `Found ${freeSlots.length} free slots`,
      };
    },
  }),

  scoreTimeSlot: tool({
    description:
      "Score a time slot based on user preferences and meeting patterns. Higher score = better slot.",
    inputSchema: z.object({
      slot: z.object({
        start: z.string().describe("ISO 8601 datetime string"),
        end: z.string().describe("ISO 8601 datetime string"),
      }),
      preferences: z
        .object({
          preferredTimes: z.array(z.string()).optional(),
          avoidTimes: z.array(z.string()).optional(),
          timezone: z.string().optional(),
        })
        .optional(),
    }),
    execute: async ({ slot, preferences }) => {
      const timeZone = preferences?.timezone || "UTC";
      let score = 1.0;
      const slotStart = parseISO(slot.start);
      const zoned = getZonedParts(slotStart, timeZone);
      const slotHour = zoned.hour;
      const slotDay = getWeekdayIndex(slotStart, timeZone); // 0 = Sunday, 6 = Saturday
      const reasons: string[] = [];
      const timeStr = `${String(zoned.hour).padStart(2, "0")}:${String(
        zoned.minute
      ).padStart(2, "0")}`;

      // Prefer mid-morning (9am-11am) and early afternoon (1pm-3pm)
      if (slotHour >= 9 && slotHour < 11) {
        score += 0.3;
        reasons.push("Optimal morning time (9-11am)");
      } else if (slotHour >= 13 && slotHour < 15) {
        score += 0.2;
        reasons.push("Good afternoon time (1-3pm)");
      } else if (slotHour < 9) {
        score -= 0.2;
        reasons.push("Early morning (before 9am)");
      } else if (slotHour >= 16) {
        score -= 0.1;
        reasons.push("Late afternoon (after 4pm)");
      }

      // Prefer weekdays over weekends
      if (slotDay === 0 || slotDay === 6) {
        score -= 0.3;
        reasons.push("Weekend slot");
      }

      // Avoid Mondays early and Fridays late
      if (slotDay === 1 && slotHour < 10) {
        score -= 0.1;
        reasons.push("Monday morning");
      }
      if (slotDay === 5 && slotHour >= 15) {
        score -= 0.1;
        reasons.push("Friday afternoon");
      }

      // Check user preferences
      if (preferences?.preferredTimes) {
        if (preferences.preferredTimes.includes(timeStr)) {
          score += 0.4;
          reasons.push("Matches preferred time");
        }
      }

      if (preferences?.avoidTimes) {
        if (preferences.avoidTimes.includes(timeStr)) {
          score -= 0.5;
          reasons.push("In avoid times list");
        }
      }

      // Normalize score to 0-1 range
      score = Math.max(0, Math.min(1, score));

      return {
        slot,
        // Calendar agent expects 0-100.
        score: Math.round(score * 100),
        reasoning: reasons.join("; ") || "Standard time slot",
        humanReadable: `${new Intl.DateTimeFormat("en-US", {
          timeZone,
          weekday: "long",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(slotStart)}`,
      };
    },
  }),
};
