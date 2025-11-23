import prisma from "@/lib/prisma";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function generateResponse({
  emailContext,
  parsedIntent,
  availableSlots,
  userId,
  senderName,
  assistantName,
}: {
  emailContext: string;
  parsedIntent: string;
  availableSlots: Record<string, string>;
  userId: string;
  senderName?: string;
  assistantName?: string;
}): Promise<string> {
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
- The sender's name and your name (the assistant)

Guidelines:
1. Keep tone conversational but professional
2. Address the sender by their actual name, not placeholders
3. Confirm all participants mentioned in the email
4. If scheduling: suggest the best available slots with specific times and timezone
5. If rescheduling: acknowledge the change and suggest alternatives
6. If canceling: politely explain and offer to reschedule
7. Always include a clear next step (what the recipient should do)
8. Keep email concise (2-3 paragraphs max)
9. End with a natural sign-off using your actual name, not placeholders
10. Be specific about times and dates, not vague
11. Make it sound like a real email from a helpful assistant`;

    const userPrompt = `
Original Email Context:
${emailContext}

Parsed Intent: ${parsedIntent}

Available Time Slots:
${slotsFormatted}

Sender Name: ${senderName || "there"}
Your Name (Assistant): ${assistantName || "Assistant"}

Generate a personalized email response addressing the sender by name and signing off naturally:`;

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
          senderName,
          assistantName,
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
          senderName,
          assistantName,
        },
        timestamp: new Date(),
      },
    });

    throw error;
  }
}
