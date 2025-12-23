/**
 * Calendar Agent - Finds optimal meeting time slots
 *
 * Uses tool calling to autonomously fetch calendar data and find available slots.
 */

import { calendarAgentInputSchema, type CalendarAgentInput } from "./types";
import { runAgentWithTools } from "../_lib/base";
import { calendarTools } from "./tools";

/**
 * Run calendar agent with tool calling
 *
 * The agent autonomously decides which tools to call and when.
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

  const prompt = `
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
    1. Use the getCalendarEvents tool to fetch calendar data for each participant
    2. Use findFreeSlots tool to find available time slots
    3. Use scoreTimeSlot tool to score each free slot based on quality and preferences
    4. Select the 3 best slots (highest scores)
    
    IMPORTANT - If no slots are found within working hours:
    5. Expand search to nearby times (earlier morning like 8am or later evening like 6pm)
    6. Try the following week if current week is fully booked
    7. Consider slightly shorter or longer meeting durations
    8. Always provide alternatives - never return empty results
    
    Think step by step and use tools as needed. Show your reasoning.
    Be helpful and proactive in finding alternatives if the initial search fails.
    </instructions>

    Today's date: ${new Date().toISOString().split("T")[0]}
    Look for slots in the next 7-14 days if needed.
  `;

  const result = await runAgentWithTools({
    agentName: "calendar-agent",
    prompt,
    tools: calendarTools,
    userId,
    maxSteps: 10,
  });

  return result;
}
