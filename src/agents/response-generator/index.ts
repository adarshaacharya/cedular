import prisma from "@/lib/prisma";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function* generateResponse({
  emailContext,
  parsedIntent,
  availableSlots,
  userId,
}: {
  emailContext: string;
  parsedIntent: string;
  availableSlots: Record<string, string>;
  userId: string;
}) {
  const startTime = Date.now();

  try {
    const slotsFormatted = Object.entries(availableSlots)
      .map(([time, score]) => `• ${time} (Score: ${score})`)
      .join("\n");

    const systemPrompt = `You are an expert email writer for scheduling meetings. 
Your task is to generate a professional, friendly email response based on:
- The original email context from the sender
- The parsed scheduling intent (schedule/reschedule/cancel/info_request)
- Available time slots from the recipient's calendar

Guidelines:
1. Keep tone conversational but professional
2. Confirm all participants mentioned in the email
3. If scheduling: suggest the best available slots with specific times and timezone
4. If rescheduling: acknowledge the change and suggest alternatives
5. If canceling: politely explain and offer to reschedule
6. Always include a clear next step (what the recipient should do)
7. Keep email concise (2-3 paragraphs max)
8. Never include signature - just the body text
9. Be specific about times and dates, not vague`;

    const userPrompt = `
Original Email Context:
${emailContext}

Parsed Intent: ${parsedIntent}

Available Time Slots:
${slotsFormatted}

Generate an appropriate email response:`;

    const result = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: userPrompt,
    });

    const duration = Date.now() - startTime;
    await prisma.agentLog.create({
      data: {
        userId,
        agentName: "response-generator",
        output: "Response generated successfully",
        latencyMs: duration,
        model: "gpt-4o-mini",
        input: {
          emailContext,
          parsedIntent,
          availableSlots,
          userId,
        },
        timestamp: new Date(),
      },
    });

    return result.text;
  } catch (error) {
    const duration = Date.now() - startTime;
    await prisma.agentLog.create({
      data: {
        userId,
        agentName: "response-generator",
        output: "Error during response generation",
        latencyMs: duration,
        model: "gpt-4o-mini",
        input: {
          emailContext,
          parsedIntent,
          availableSlots,
          userId,
        },
        timestamp: new Date(),
      },
    });

    throw error;

    throw error;
  }
}
