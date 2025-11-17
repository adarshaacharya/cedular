import { z } from "zod";
import { runAgent } from "../_lib/base";
import { getCalendarEvents } from "@/integrations/calendar";
import {
  calendarAgentInputSchema,
  calendarAgentOutputSchema,
  TimeSlot,
  type CalendarAgentInput,
} from "./types";
import { addMinutes, isWithinInterval, parseISO, format } from "date-fns";
import { CalendarEvent } from "@/integrations/calendar/types";

function buildPrompt({
  participants,
  duration,
  preferences,
}: CalendarAgentInput & { calendarData: CalendarEvent[] }) {
  return `
    
    <identity>
    You are a calendar scheduling expert. Analyze the calendar data and find the 3 best time slots for the meeting.
    </identity>

    <calendar-data>
            ${JSON.stringify(calendarData, null, 2)}
    </calendar-data>

    <candidate-time-slots>

    
    `;
}
