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
  format,
  isWithinInterval,
  parseISO,
  setHours,
  setMinutes,
  startOfDay,
} from "date-fns";

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
      workingHoursStart,
      workingHoursEnd,
      daysToCheck,
    }) => {
      const freeSlots: Array<{ start: string; end: string }> = [];
      const [startHour, startMinute] = workingHoursStart.split(":").map(Number);
      const [endHour, endMinute] = workingHoursEnd.split(":").map(Number);

      // Parse busy periods
      const busyIntervals = busyPeriods.map((period) => ({
        start: parseISO(period.start),
        end: parseISO(period.end),
      }));

      // Check each day
      for (let dayOffset = 0; dayOffset < daysToCheck; dayOffset++) {
        const currentDay = addDays(startOfDay(new Date()), dayOffset);
        let currentTime = setMinutes(
          setHours(currentDay, startHour),
          startMinute
        );
        const dayEnd = setMinutes(setHours(currentDay, endHour), endMinute);

        // Iterate through the day in 30-minute increments
        while (currentTime < dayEnd) {
          const slotEnd = addMinutes(currentTime, duration);

          // Skip if slot extends beyond working hours
          if (slotEnd > dayEnd) {
            break;
          }

          // Check if this slot conflicts with any busy period
          const hasConflict = busyIntervals.some(
            (busy) =>
              isWithinInterval(currentTime, {
                start: busy.start,
                end: busy.end,
              }) ||
              isWithinInterval(slotEnd, { start: busy.start, end: busy.end }) ||
              (currentTime <= busy.start && slotEnd >= busy.end)
          );

          if (!hasConflict) {
            freeSlots.push({
              start: currentTime.toISOString(),
              end: slotEnd.toISOString(),
            });
          }

          // Move to next slot (30 min increments)
          currentTime = addMinutes(currentTime, 30);
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
      let score = 1.0;
      const slotStart = parseISO(slot.start);
      const slotHour = slotStart.getHours();
      const slotDay = slotStart.getDay(); // 0 = Sunday, 6 = Saturday
      const reasons: string[] = [];

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
        const timeStr = format(slotStart, "HH:mm");
        if (preferences.preferredTimes.includes(timeStr)) {
          score += 0.4;
          reasons.push("Matches preferred time");
        }
      }

      if (preferences?.avoidTimes) {
        const timeStr = format(slotStart, "HH:mm");
        if (preferences.avoidTimes.includes(timeStr)) {
          score -= 0.5;
          reasons.push("In avoid times list");
        }
      }

      // Normalize score to 0-1 range
      score = Math.max(0, Math.min(1, score));

      return {
        slot,
        score: parseFloat(score.toFixed(2)),
        reasoning: reasons.join("; ") || "Standard time slot",
        humanReadable: `${format(slotStart, "EEEE, MMMM d 'at' h:mm a")}`,
      };
    },
  }),
};
