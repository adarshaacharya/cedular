/**
 * Calendar Agent - Finds optimal meeting time slots
 *
 * Uses ToolLoopAgent to autonomously fetch calendar data and find available slots.
 */

import { calendarAgentInputSchema, type CalendarAgentInput } from "./types";
import { runToolLoopAgent } from "../_lib/base";
import { calendarTools } from "./tools";

/**
 * Run calendar agent with tool calling
 *
 * The agent autonomously decides which tools to call and when.
 * Uses ToolLoopAgent which automatically loops through tool calls (up to 20 steps).
 *
 * @param input - Calendar agent input with participants and preferences
 * @param userId - User ID for logging
 * @returns Result with text, tool calls, and tool results
 */
export async function runCalendarAgent(
  input: CalendarAgentInput,
  userId: string
) {
  const validatedInput = calendarAgentInputSchema.parse(input);

  const instructions = `
    <identity>
    You are a calendar scheduling expert with access to calendar tools.
    Use the available tools to find the 3 best time slots for scheduling a meeting.
    </identity>

    <task>
    Find the 3 best time slots for a meeting with:
    - Participants: ${validatedInput.participants.join(", ")}
    - Duration: ${validatedInput.duration} minutes
    - Working hours: ${
      validatedInput.preferences?.workingHoursStart || "09:00"
    } to ${validatedInput.preferences?.workingHoursEnd || "17:00"}
    - Timezone: ${validatedInput.preferences?.timezone || "UTC"}
    - Buffer: ${validatedInput.preferences?.bufferMinutes || 15} minutes
    ${
      validatedInput.preferences?.preferredTimes
        ? `- Preferred times: ${validatedInput.preferences.preferredTimes.join(
            ", "
          )}`
        : ""
    }
    ${
      validatedInput.preferences?.avoidTimes
        ? `- Avoid times: ${validatedInput.preferences.avoidTimes.join(", ")}`
        : ""
    }
    </task>

    <instructions>
    Find free time in the assistant's schedule where the meeting can be scheduled.

    STEP-BY-STEP PROCESS:
    1. First, call getUserCalendarEvents with userId="${userId}" and daysAhead=7 to get the assistant's busy periods
    2. Then, call findFreeSlots with the busy periods and meeting requirements to find available slots
    3. Finally, call scoreTimeSlot for each slot to rank them by quality
    
    If no slots are found within working hours:
    1. Expand search to nearby times (earlier morning like 8am or later evening like 6pm)
    2. Try the following week if current week is fully booked (use daysAhead=14)
    3. Consider slightly shorter or longer meeting durations
    4. Always provide alternatives - never return empty results
    
    NOTE: You can only access the assistant's calendar, not the participants' calendars.
    
    Think step by step and use tools as needed. Show your reasoning.
    Be helpful and proactive in finding alternatives if the initial search fails.
    </instructions>

    Today's date: ${new Date().toISOString().split("T")[0]}
    Look for slots in the next 7-14 days if needed.
  `;

  const result = await runToolLoopAgent({
    agentName: "calendar-agent",
    instructions,
    prompt: `Please find the 3 best meeting slots.`,
    tools: calendarTools,
    userId,
  });

  return result;
}
