/**
 * Email Parser Agent
 *
 * Extracts scheduling intent, participants, duration, and urgency from email messages
 */

import { z } from "zod";
import { runAgent } from "../_lib/base";

export const emailIntentSchema = z.object({
  intent: z
    .enum(["schedule", "reschedule", "cancel", "info_request", "confirm"])
    .describe("The primary scheduling intent of the email"),
  participants: z
    .array(z.string().email())
    .describe("Email addresses of participants mentioned in the email"),
  proposedTimes: z
    .array(z.string())
    .optional()
    .describe("ISO 8601 datetime strings of proposed meeting times"),
  duration: z
    .number()
    .optional()
    .describe("Meeting duration in minutes (e.g., 30, 60, 90)"),
  title: z.string().describe("Extracted meeting title or subject"),
  context: z
    .string()
    .describe("Brief summary of the email content and scheduling context"),
  urgency: z
    .enum(["low", "medium", "high"])
    .describe("Urgency level based on language and context"),
  chosenSlotIndex: z
    .number()
    .nullable()
    .optional()
    .describe(
      "Index of the chosen time slot (0, 1, or 2) when intent is confirm"
    ),
});

export type EmailParseResult = z.infer<typeof emailIntentSchema>;

/**
 * Parse an email to extract scheduling information
 *
 * @param emailBody - The latest email body text
 * @param subject - The email subject line
 * @param userId - User ID for logging
 * @param threadHistory - Optional array of previous messages in the thread
 * @param existingThreadStatus - Optional status of existing thread in DB (e.g., 'awaiting_confirmation')
 * @returns Structured scheduling information extracted from the email
 */
export async function parseEmail({
  emailBody,
  subject,
  userId,
  threadHistory,
  existingThreadStatus,
}: {
  emailBody: string;
  subject: string;
  userId: string;
  threadHistory?: Array<{ body: string; snippet?: string | null }>;
  existingThreadStatus?: string | null;
}): Promise<EmailParseResult> {
  // Build conversation context from thread history
  const conversationContext =
    threadHistory && threadHistory.length > 1
      ? threadHistory
          .map((msg, i) => `--- Message ${i + 1} ---\n${msg.body}`)
          .join("\n\n")
      : null;

  // Hint about existing thread status
  const statusHint =
    existingThreadStatus === "awaiting_confirmation"
      ? `\n\n<important>\nThis thread is currently AWAITING CONFIRMATION. The assistant previously proposed time slots.\nIf the user is agreeing to a time, responding positively, or mentioning "option 1/2/3", "first/second/third",\nor a specific time that was proposed, the intent should be "confirm" with the appropriate chosenSlotIndex.\n</important>`
      : "";

  const prompt = `
    <identity>
    You are an expert email scheduling assistant. Your job is to parse scheduling-related emails
    and extract structured information that will be used to automatically schedule meetings.
    </identity>

    <task>
    Parse the following email and extract:
    1. The scheduling intent (schedule new, reschedule existing, cancel, confirm, or info request)
    2. All participant email addresses mentioned
    3. Proposed meeting times (if mentioned)
    4. Meeting duration in minutes
    5. Meeting title/topic
    6. Summary context
    7. Urgency level (low/medium/high)
    8. If intent is "confirm", set chosenSlotIndex (0, 1, or 2) based on which option user selected
    </task>${statusHint}${
    conversationContext
      ? `

    <thread_history>
    ${conversationContext}
    </thread_history>`
      : ""
  }

    <latest_email>
    Subject: ${subject}
    Body: ${emailBody}
    </latest_email>

    <guidelines>
    - Extract ALL participant email addresses, even if not explicitly labeled
    - Look for duration hints like "30 min", "1 hour", "1.5 hours", "quick sync"
    - Parse common time formats: "tomorrow at 2pm", "next Tuesday 10:00", "Monday morning"
    - If no explicit time is proposed, leave proposedTimes empty
    - Urgency should be HIGH if: ASAP, urgent, emergency, IMPORTANT, today
    - Urgency should be MEDIUM if: normal priority, this week, soon
    - Urgency should be LOW if: flexible, whenever, no rush, when convenient
    - For reschedule intent, still extract all relevant info
    - For cancel intent, extract why it's being cancelled
    - For confirm intent: User is confirming a proposed time (e.g., "Tuesday works", "option 2", "the first one")
    - Set chosenSlotIndex: 0 for first option, 1 for second, 2 for third
    - Look for keywords: "first", "second", "third", "option 1/2/3", or specific day/time
    </guidelines>

    <examples>
    Example 1: Schedule intent
    "Hi team, can we schedule a 1-hour sync next Tuesday at 10am to discuss Q4 plans? john@company.com and sarah@company.com should join too."
    → intent: "schedule", duration: 60, urgency: "medium", participants: ["john@company.com", "sarah@company.com"]

    Example 2: Reschedule intent
    "We need to move tomorrow's 2pm standup to 3pm instead. Same attendees."
    → intent: "reschedule", duration: 30 (assume standard standup), urgency: "high"

    Example 3: Info request
    "When is our next sync scheduled? I want to make sure I'm free."
    → intent: "info_request", urgency: "low"

    Example 4: Confirm intent
    "Tuesday 2pm works for me!"
    → intent: "confirm", chosenSlotIndex: 0, urgency: "medium"

    Example 5: Confirm intent
    "Let's go with the second option"
    → intent: "confirm", chosenSlotIndex: 1, urgency: "medium"
    </examples>

    Return ONLY valid JSON matching the schema. No explanations.
  `;

  const result = await runAgent({
    agentName: "email-parser",
    prompt,
    schema: emailIntentSchema,
    userId,
  });

  return result;
}
