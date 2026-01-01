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
Your task is to generate a professional, friendly HTML email response based on:
- The original email context from the sender
- The parsed scheduling intent (schedule/reschedule/cancel/info_request)
- Available time slots from the recipient's calendar
- The sender's name and your name (the assistant)

IMPORTANT: Return the email as HTML with proper formatting.

Guidelines:
1. Keep tone conversational but professional
2. Address the sender by their actual name, not placeholders
3. Confirm all participants mentioned in the email
4. If scheduling: suggest the best available slots with specific times and timezone
5. If rescheduling: acknowledge the change and suggest alternatives
6. If canceling: politely explain and offer to reschedule
7. Always include a clear next step (what the recipient should do)
8. Use separate <p> tags for each paragraph (proper spacing)
9. Use <br /> for line breaks within a paragraph if needed
10. Format time slots as a clean bulleted list using <ul> and <li> tags
11. End with a natural sign-off using your actual name, not placeholders
12. Be specific about times and dates, not vague
13. Make it sound like a real email from a helpful assistant
14. Do NOT include <html>, <body>, or <head> tags - just the content with <p>, <ul>, <li>, etc.

Example format:
<p>Hi [Name],</p>
<p>Thank you for reaching out...</p>
<p>Here are some available times:</p>
<ul>
<li>Tuesday at 9:00 AM - 9:30 AM</li>
<li>Tuesday at 10:00 AM - 10:30 AM</li>
</ul>
<p>Please let me know...</p>
<p>Best regards,<br />[Your Name]</p>`;

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
      experimental_telemetry: { isEnabled: true },
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
