/**
 * Calendar Agent - Finds optimal meeting time slots
 *
 * Uses ToolLoopAgent to autonomously fetch calendar data and find available slots.
 */

import { Output } from "ai";
import {
  calendarAgentInputSchema,
  calendarAgentOutputSchema,
  type CalendarAgentInput,
  type CalendarAgentOutput,
} from "./types";
import { runToolLoopAgent } from "../_lib/base";
import { calendarTools } from "./tools";

/**
 * Run calendar agent with tool calling and structured output
 *
 * The agent autonomously decides which tools to call and when.
 * Uses ToolLoopAgent which automatically loops through tool calls (up to 20 steps).
 * Returns structured output with slots directly in result.output.slots
 *
 * @param input - Calendar agent input with participants and preferences
 * @param userId - User ID for logging
 * @returns Result with structured output containing slots
 */
export async function runCalendarAgent(
  input: CalendarAgentInput,
  userId: string
): Promise<{ output: CalendarAgentOutput }> {
  const validatedInput = calendarAgentInputSchema.parse(input);

  const instructions = `
    <identity>
    You are a calendar scheduling expert with access to calendar tools.
    Use the available tools to find the 3 best time slots for scheduling a meeting.
    After using the tools to find and score slots, you must return them in the required structured format.
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
    4. Return the top 3 scored slots in the required structured format (slots array with start, end, score, reason)

    If no slots are found within working hours:
    1. Expand search to nearby times (earlier morning like 8am or later evening like 6pm)
    2. Try the following week if current week is fully booked (use daysAhead=14)
    3. Consider slightly shorter or longer meeting durations
    4. Always provide alternatives - never return empty results

    NOTE: You can only access the assistant's calendar, not the participants' calendars.

    Think step by step and use tools as needed. Show your reasoning.
    Be helpful and proactive in finding alternatives if the initial search fails.

    IMPORTANT: After using the tools, extract the slot information from the tool results and return it
    in the structured format. Use the score from scoreTimeSlot, and format the score as a number between 0-100.
    </instructions>

    Today's date: ${new Date().toISOString().split("T")[0]}
    Look for slots in the next 7-14 days if needed.
  `;

  const result = await runToolLoopAgent({
    agentName: "calendar-agent",
    instructions,
    prompt: `Please find the 3 best meeting slots and return them in the structured format.`,
    tools: calendarTools,
    userId,
    output: Output.object({
      schema: calendarAgentOutputSchema,
    }),
  });

  if (!result.output) {
    throw new Error("Calendar agent did not return structured output");
  }

  return {
    output: result.output as CalendarAgentOutput,
  };
}
