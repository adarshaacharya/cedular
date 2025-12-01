/**
 * Calendar Agent - Finds optimal meeting time slots
 *
 * Analyzes participant calendars and meeting preferences to identify
 * the 3 best time slots for scheduling a meeting.
 */

import { z } from "zod";
import { getCalendarEvents } from "@/integrations/calendar";
import {
  calendarAgentInputSchema,
  CalendarAgentOutput,
  calendarAgentOutputSchema,
  TimeSlot,
  type CalendarAgentInput,
} from "./types";
import { addMinutes, isWithinInterval, parseISO, format } from "date-fns";
import { CalendarEvent } from "@/integrations/calendar/types";
import { runAgent } from "../_lib/base";

function buildPrompt({
  participants,
  duration,
  preferences,
  calendarData,
}: CalendarAgentInput & { calendarData: CalendarEvent[] }) {
  const workingHoursStart = preferences?.workingHoursStart ?? "09:00";
  const workingHoursEnd = preferences?.workingHoursEnd ?? "17:00";

  return `
    <identity>
    You are a calendar scheduling expert. Analyze the calendar data and find the 3 best time slots for the meeting.
    </identity>


    <constraints>
    - Meeting duration: ${duration} minutes
    - Participants: ${participants.join(", ")}'
    - Working hours start: ${workingHoursStart}
    - Working hours end: ${workingHoursEnd}
    - Timezone: ${preferences?.timezone || "UTC"}
    - Buffer between meetings: ${preferences?.bufferMinutes ?? 15} minutes
    ${
      preferences?.preferredTimes
        ? `- Preferred times: ${preferences.preferredTimes.join(", ")}`
        : ""
    }
    ${
      preferences?.avoidTimes
        ? `- Times to avoid: ${preferences.avoidTimes.join(", ")}`
        : ""
    }
    </constraints>

    <calendar-data>
    ${JSON.stringify(calendarData, null, 2)}
    </calendar-data>


    <candidate-time-slots>
    Find the 3 best non-overlapping time slots that:
    1. Don't conflict with any participant's calendar
    2. Fall within working hours
    3. Have sufficient buffer time before/after existing events
    4. Prefer times in preferred time windows if specified
    5. Rank by likelihood of participant availability

    IMPORTANT: Return start and end times as FULL ISO 8601 datetime strings including the date.
    Example: "2025-12-02T09:00:00" NOT just "09:00"
    
    Use dates within the next 7 days from today.
    Today's date is: ${new Date().toISOString().split("T")[0]}

    Return as JSON with exactly 3 slots, ordered by preference.
    </candidate-time-slots>
    `;
}

/**
 * Run the calendar agent to find available meeting times
 *
 * @param input - Calendar agent input with participants and preferences
 * @param userId - User ID for logging
 * @returns Array of recommended time slots with scores and reasons
 */
export async function runCalendarAgent(
  input: CalendarAgentInput,
  userId: string
): Promise<CalendarAgentOutput> {
  const validatedInput = calendarAgentInputSchema.parse(input);

  const calendarData = await Promise.all(
    validatedInput.participants.map((email) =>
      getCalendarEvents({
        attendeeEmail: email,
        userId,
        timeMin: new Date(),
        timeMax: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days ahead
      })
    )
  ).then((results) => results.flat());

  const prompt = buildPrompt({
    ...validatedInput,
    calendarData,
  });

  const result = await runAgent({
    agentName: "calendar-agent",
    prompt,
    schema: calendarAgentOutputSchema,
    userId,
  });
  const validatedOutput = calendarAgentOutputSchema.parse(result);

  return validatedOutput;
}
