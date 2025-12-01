import { HandlerInput, HandlerOutput } from "./types";
import { runCalendarAgent } from "@/agents/calendar-agent";
import { generateResponse } from "@/agents/response-generator";
import { sendEmail } from "@/integrations/gmail";
import { createEmailThread } from "@/services/email-thread-service";
import {
  EmailThreadIntent,
  EmailThreadStatus,
} from "@/prisma/generated/prisma/enums";

export async function handleSchedule(
  input: HandlerInput
): Promise<HandlerOutput> {
  const {
    emailThread,
    parsedIntent,
    userId,
    userPreferences,
    senderName,
    assistantName,
  } = input;

  try {
    console.log(
      `[ScheduleHandler] Processing schedule request for thread: ${emailThread.threadId}`
    );

    // 1. Find optimal calendar slots
    console.log(`[ScheduleHandler] Finding optimal calendar slots`);
    const { slots: availableSlots } = await runCalendarAgent(
      {
        participants: parsedIntent.participants || [],
        duration: parsedIntent.duration || 60,
        preferences: {
          timezone: userPreferences.timezone || "UTC",
          workingHoursStart: "09:00",
          workingHoursEnd: "17:00",
          bufferMinutes: 15,
        },
      },
      userId
    );

    if (!availableSlots || availableSlots.length === 0) {
      console.warn(`[ScheduleHandler] No available slots found`);
      return {
        success: false,
        threadId: emailThread.threadId,
        error: "No available time slots found",
      };
    }

    console.log(
      `[ScheduleHandler] Found ${availableSlots.length} available slots`
    );

    // 2. Format slots for response generator
    const slotsFormatted = availableSlots.reduce((acc, slot) => {
      acc[`${slot.start} - ${slot.end}`] = slot.score.toString();
      return acc;
    }, {} as Record<string, string>);

    // 3. Generate response email with proposed times
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

    // 4. Send email
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

    // 5. Save email thread with proposedSlots
    await createEmailThread({
      userId,
      threadId: emailThread.threadId,
      subject: emailThread.subject,
      participants: [emailThread.from],
      intent: EmailThreadIntent.schedule,
      status: EmailThreadStatus.awaiting_confirmation,
      proposedSlots: availableSlots.map((slot) => ({
        start: slot.start,
        end: slot.end,
        score: slot.score,
      })),
    });

    console.log(`[ScheduleHandler] Email thread saved with proposed slots`);

    // 6. Return result
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
