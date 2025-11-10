import { z } from "zod";
import { runAgent } from "../_lib/base";

export const emailIntentSchema = z.object({
  intent: z.enum(["schedule", "reschedule", "cancel", "info_request"]),
  participants: z.array(z.string().email()),
  proposedTimes: z.array(z.string()).optional(),
  duration: z.number().optional(), // in minutes
  title: z.string(),
  context: z.string(), // summary of email content
  urgency: z.enum(["low", "medium", "high"]),
});

export async function parseEmail({
  emailBody,
  subject,
  userId,
}: {
  emailBody: string;
  subject: string;
  userId: string;
}) {
  const prompt = `Parse this scheduling email and extract structured information:
    Subject: ${subject}
    Body: ${emailBody}

    Extract the scheduling intent, participants, proposed times, duration, and context.
    `;

  return await runAgent({
    agentName: "email-parser",
    prompt,
    schema: emailIntentSchema,
    userId,
  });
}
