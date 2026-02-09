/**
 * Calendar Agent - Finds optimal meeting time slots
 *
 * Uses ToolLoopAgent to autonomously fetch calendar data and find available slots.
 */

import { Output } from "ai";
import { jsonrepair } from "jsonrepair";
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
      validatedInput.preferences?.startDate
        ? `- Requested start date: ${validatedInput.preferences.startDate} (YYYY-MM-DD in timezone)`
        : ""
    }
    ${
      validatedInput.preferences?.daysToCheck
        ? `- Days to check: ${validatedInput.preferences.daysToCheck}`
        : ""
    }
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
    2. Then, call findFreeSlots with the busy periods and meeting requirements to find available slots.
       Always pass timezone="${validatedInput.preferences?.timezone || "UTC"}" and bufferMinutes=${validatedInput.preferences?.bufferMinutes || 15}
       If a requested start date was provided, also pass startDate="${validatedInput.preferences?.startDate || ""}" and daysToCheck=${validatedInput.preferences?.daysToCheck || 1}
    3. Finally, call scoreTimeSlot for each slot to rank them by quality
    4. Return the top 3 scored slots in the required structured format (slots array with start, end, score, reason)

    If no slots are found within working hours:
    1. Expand search to nearby times (earlier morning like 8am or later evening like 6pm)
    2. Try the following week if current week is fully booked (use daysAhead=14)
    3. Consider slightly shorter or longer meeting durations
    4. Always provide alternatives - never return empty results

	    NOTE: You can only access the assistant's calendar, not the participants' calendars.
	
	    IMPORTANT OUTPUT RULES:
	    - Your final response MUST be a single JSON object matching the schema.
	    - Do NOT include any prose, explanation, markdown, or code fences.
	    - Do NOT wrap the JSON in \`\`\`json.
	    Be helpful and proactive in finding alternatives if the initial search fails.

    IMPORTANT: After using the tools, extract the slot information from the tool results and return it
    in the structured format. Use the score from scoreTimeSlot, and format the score as a number between 0-100.
    </instructions>

    Today's date: ${new Date().toISOString().split("T")[0]}
    Look for slots in the next 7-14 days if needed.
  `;

  let result;
  try {
    result = await runToolLoopAgent({
      agentName: "calendar-agent",
      instructions,
      prompt: `Return ONLY the JSON object for the 3 best meeting slots in the structured format. No prose, no markdown.`,
      tools: calendarTools,
      userId,
      output: Output.object({
        schema: calendarAgentOutputSchema,
      }),
    });
  } catch (err) {
    // The model sometimes returns the correct JSON wrapped in prose or ```json fences.
    // Recover if possible, since downstream expects structured slots.
    const anyErr = err as any;
    const text: string | undefined =
      typeof anyErr?.text === "string"
        ? anyErr.text
        : typeof anyErr?.cause?.text === "string"
          ? anyErr.cause.text
          : typeof anyErr?.cause?.message === "string"
            ? anyErr.cause.message
            : undefined;

    if (text) {
      const fenced = text.match(/```json\s*([\s\S]*?)\s*```/i);
      const candidate = fenced?.[1] || text;
      const first = candidate.indexOf("{");
      const last = candidate.lastIndexOf("}");
      if (first !== -1 && last !== -1 && last > first) {
        const slice = candidate.slice(first, last + 1);
        try {
          const repaired = jsonrepair(slice);
          const parsed = JSON.parse(repaired);
          const validated = calendarAgentOutputSchema.parse(parsed);
          return { output: validated as CalendarAgentOutput };
        } catch {
          // fall through to rethrow original error
        }
      }
    }

    throw err;
  }

  if (!result.output) {
    throw new Error("Calendar agent did not return structured output");
  }

  return {
    output: result.output as CalendarAgentOutput,
  };
}
