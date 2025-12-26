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
    console.log(
      "[ScheduleHandler][Debug] Loaded scheduleProfile:",
      scheduleProfile
    );

    // 2. Find optimal calendar slots
    const calendarAgentInput = {
      participants: emailThread.participants || [emailThread.from],
      duration: parsedIntent.duration || 60,
      preferences: {
        timezone: scheduleProfile?.timezone || "UTC",
        workingHoursStart: scheduleProfile?.workingHoursStart || "09:00",
        workingHoursEnd: scheduleProfile?.workingHoursEnd || "17:00",
        bufferMinutes: scheduleProfile?.bufferMinutes || 15,
      },
    };

    const calendarResult = await runCalendarAgent(calendarAgentInput, userId);

    // --- Slot Extraction Logic ---
    // Prefer scored slots from scoreTimeSlot, fallback to unscored slots from findFreeSlots
    const scoredSlots: Array<{ start: string; end: string; score: number }> =
      [];
    const unscoredSlots: Array<{ start: string; end: string }> = [];

    if (calendarResult.steps) {
      for (const step of calendarResult.steps) {
        if (step.toolResults) {
          for (const toolResult of step.toolResults) {
            if (toolResult.toolName === "scoreTimeSlot") {
              const output = toolResult.output;
              if (
                output &&
                typeof output === "object" &&
                "slot" in output &&
                "score" in output
              ) {
                const scoredSlot = output as {
                  slot: { start: string; end: string };
                  score: number;
                };
                scoredSlots.push({
                  start: scoredSlot.slot.start,
                  end: scoredSlot.slot.end,
                  score: scoredSlot.score,
                });
              }
            }
            if (toolResult.toolName === "findFreeSlots") {
              const output = toolResult.output;
              // findFreeSlots returns { freeSlots: [...], count: N, message: "..." }
              if (
                output &&
                typeof output === "object" &&
                "freeSlots" in output &&
                Array.isArray(output.freeSlots)
              ) {
                for (const slot of output.freeSlots) {
                  if (slot && slot.start && slot.end) {
                    unscoredSlots.push({ start: slot.start, end: slot.end });
                  }
                }
              }
            }
          }
        }
      }
    }
    console.log("[ScheduleHandler][Debug] scoredSlots:", scoredSlots);
    console.log("[ScheduleHandler][Debug] unscoredSlots:", unscoredSlots);

    let topSlots: Array<{ start: string; end: string; score?: number }> = [];
    if (scoredSlots.length > 0) {
      scoredSlots.sort((a, b) => b.score - a.score);
      topSlots = scoredSlots.slice(0, 3);
      console.log(
        `[ScheduleHandler] Found ${topSlots.length} scored slots from agent tool calls`
      );
    } else if (unscoredSlots.length > 0) {
      topSlots = unscoredSlots.slice(0, 3);
      console.log(
        `[ScheduleHandler] No scored slots found, using ${topSlots.length} unscored slots from findFreeSlots`
      );
    } else {
      console.log(`[ScheduleHandler] No available slots found by agent`);
    }
    console.log("[ScheduleHandler][Debug] topSlots:", topSlots);

    // 3. Format slots for response generator (or empty if none found)
    const slotsFormatted =
      topSlots.length > 0
        ? topSlots.reduce((acc, slot) => {
            acc[`${slot.start} - ${slot.end}`] = slot.score?.toString() ?? "";
            return acc;
          }, {} as Record<string, string>)
        : {};

    if (topSlots.length > 0) {
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

      // 6. Save email thread with proposedSlots
      await createEmailThread({
        userId,
        threadId: emailThread.threadId,
        subject: emailThread.subject,
        participants: emailThread.participants || [emailThread.from],
        intent: EmailThreadIntent.schedule,
        status: EmailThreadStatus.awaiting_confirmation,
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
    } else {
      // No slots found: send a polite failure message and set thread status to failed
      const noSlotsMessage = `Hi ${senderName},\n\nUnfortunately, I couldn't find any available time slots for your requested meeting. Please try again with different preferences or dates, or reach out if you need further assistance.\n\nBest regards,\n${assistantName}`;
      console.log(`[ScheduleHandler] No slots found, sending failure message`);
      const latestMessageId =
        emailThread.messages[emailThread.messages.length - 1]?.id;
      await sendEmail({
        to: emailThread.from,
        body: noSlotsMessage,
        userId,
        subject:
          emailThread.subject && emailThread.subject.trim()
            ? `Re: ${emailThread.subject.replace(/^Re:\s*/i, "")}`
            : "Re: Meeting Request",
        threadId: emailThread.threadId,
        messageId: latestMessageId,
      });
      await createEmailThread({
        userId,
        threadId: emailThread.threadId,
        subject: emailThread.subject,
        participants: emailThread.participants || [emailThread.from],
        intent: EmailThreadIntent.schedule,
        status: EmailThreadStatus.failed,
        proposedSlots: [],
      });
      return {
        success: false,
        threadId: emailThread.threadId,
        error: "No available slots found",
      };
    }
  } catch (error) {
    console.error(`[ScheduleHandler] Error:`, error);
    return {
      success: false,
      threadId: emailThread.threadId,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
