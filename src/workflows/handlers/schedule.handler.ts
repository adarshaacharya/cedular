import { HandlerInput, HandlerOutput } from "./types";
import { runCalendarAgent } from "@/agents/calendar-agent";
import { generateResponse } from "@/agents/response-generator";
import { sendEmail } from "@/integrations/gmail";
import { createEmailThread } from "@/services/email-thread-service";
import {
  EmailThreadIntent,
  EmailThreadStatus,
} from "@/prisma/generated/prisma/enums";
import prisma from "@/lib/prisma";

export async function handleSchedule(
  input: HandlerInput
): Promise<HandlerOutput> {
  const { emailThread, parsedIntent, userId, senderName, assistantName } =
    input;

  try {
    console.log(
      `[ScheduleHandler] Processing schedule request for thread: ${emailThread.threadId}`
    );

    // 1. Fetch user schedule profile
    const scheduleProfile = await prisma.userScheduleProfile.findUnique({
      where: { userId },
    });

    // 2. Find optimal calendar slots
    console.log(`[ScheduleHandler] Finding optimal calendar slots`);
    const calendarResult = await runCalendarAgent(
      {
        participants: parsedIntent.participants || [],
        duration: parsedIntent.duration || 60,
        preferences: {
          timezone: scheduleProfile?.timezone || "UTC",
          workingHoursStart: scheduleProfile?.workingHoursStart || "09:00",
          workingHoursEnd: scheduleProfile?.workingHoursEnd || "17:00",
          bufferMinutes: scheduleProfile?.bufferMinutes || 15,
        },
      },
      userId
    );

    // Extract scored slots from tool results
    const availableSlots: Array<{
      start: string;
      end: string;
      score: number;
    }> = [];

    // Look through all steps for scoreTimeSlot tool results
    if (calendarResult.steps) {
      for (const step of calendarResult.steps) {
        if (step.toolResults) {
          for (const toolResult of step.toolResults) {
            if (
              toolResult.toolName === "scoreTimeSlot" &&
              "result" in toolResult
            ) {
              const scoredSlot = toolResult.result as {
                slot: { start: string; end: string };
                score: number;
              };
              availableSlots.push({
                start: scoredSlot.slot.start,
                end: scoredSlot.slot.end,
                score: scoredSlot.score,
              });
            }
          }
        }
      }
    }

    // Sort by score descending and take top 3
    availableSlots.sort((a, b) => b.score - a.score);
    const topSlots = availableSlots.slice(0, 3);

    console.log(
      `[ScheduleHandler] Found ${topSlots.length} available slots from agent tool calls`
    );

    // 3. Format slots for response generator (or empty if none found)
    const slotsFormatted =
      topSlots.length > 0
        ? topSlots.reduce((acc, slot) => {
            acc[`${slot.start} - ${slot.end}`] = slot.score.toString();
            return acc;
          }, {} as Record<string, string>)
        : {};

    // 4. Generate response email with proposed times
    console.log(`[ScheduleHandler] Generating email response`);
    const generatedResponse = await generateResponse({
      emailContext: emailThread.body,
      parsedIntent: parsedIntent.intent,
      availableSlots: slotsFormatted,
      userId,
      senderName,
      assistantName,
    });

    if (!generatedResponse) {
      throw new Error("Failed to generate email response");
    }

    // 5. Send email
    console.log(`[ScheduleHandler] Sending email response`);
    const latestMessageId =
      emailThread.messages[emailThread.messages.length - 1]?.id;

    const sentMessage = await sendEmail({
      to: emailThread.from,
      body: generatedResponse,
      userId,
      subject:
        emailThread.subject && emailThread.subject.trim()
          ? `Re: ${emailThread.subject.replace(/^Re:\s*/i, "")}`
          : "Re: Meeting Request",
      threadId: emailThread.threadId,
      messageId: latestMessageId,
    });

    console.log(
      `[ScheduleHandler] Response email sent: ${sentMessage.messageId}`
    );

    // 6. Save email thread with proposedSlots (empty array if none found)
    await createEmailThread({
      userId,
      threadId: emailThread.threadId,
      subject: emailThread.subject,
      participants: [emailThread.from],
      intent: EmailThreadIntent.schedule,
      status:
        topSlots.length > 0
          ? EmailThreadStatus.awaiting_confirmation
          : EmailThreadStatus.failed,
      proposedSlots: topSlots.map((slot) => ({
        start: slot.start,
        end: slot.end,
        score: slot.score,
      })),
    });

    console.log(`[ScheduleHandler] Email thread saved with proposed slots`);

    // 7. Return result
    return {
      success: true,
      threadId: emailThread.threadId,
      responseMessageId: sentMessage.messageId ?? undefined,
    };
  } catch (error) {
    console.error(`[ScheduleHandler] Error:`, error);
    return {
      success: false,
      threadId: emailThread.threadId,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
