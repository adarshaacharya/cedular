import { HandlerInput, HandlerOutput } from "./types";
import { runCalendarAgent } from "@/agents/calendar-agent";
import { generateResponse } from "@/agents/response-generator";
import { sendEmail } from "@/integrations/gmail";
import prisma from "@/lib/prisma";
import { EmailThreadStatus } from "@/prisma/generated/prisma/enums";

export async function handleReschedule(
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
      `[RescheduleHandler] Processing reschedule request for thread: ${emailThread.threadId}`
    );

    // 1. Check if thread exists in DB
    const dbThread = await prisma.emailThread.findUnique({
      where: { threadId: emailThread.threadId },
    });

    if (!dbThread) {
      console.warn(
        `[RescheduleHandler] Thread not found in DB, treating as new schedule request`
      );
    }

    // 2. Find new optimal calendar slots
    console.log(`[RescheduleHandler] Finding new available slots`);
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
      console.warn(`[RescheduleHandler] No available slots found`);
      return {
        success: false,
        threadId: emailThread.threadId,
        error: "No available time slots found for rescheduling",
      };
    }

    console.log(
      `[RescheduleHandler] Found ${availableSlots.length} available slots`
    );

    // 3. Format slots for response generator
    const slotsFormatted = availableSlots.reduce((acc, slot) => {
      acc[`${slot.start} - ${slot.end}`] = slot.score.toString();
      return acc;
    }, {} as Record<string, string>);

    // 4. Generate response email with new proposed times
    console.log(`[RescheduleHandler] Generating reschedule response`);
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
    console.log(`[RescheduleHandler] Sending reschedule response`);
    const latestMessageId =
      emailThread.messages[emailThread.messages.length - 1]?.id;

    const sentMessage = await sendEmail({
      to: emailThread.from,
      body: generatedResponse,
      userId,
      subject: `Re: ${emailThread.subject.replace(/^Re:\s*/i, "")}`,
      threadId: emailThread.threadId,
      messageId: latestMessageId,
    });

    console.log(
      `[RescheduleHandler] Response email sent: ${sentMessage.messageId}`
    );

    // 6. Update email thread with new proposed slots
    if (dbThread) {
      await prisma.emailThread.update({
        where: { id: dbThread.id },
        data: {
          status: EmailThreadStatus.awaiting_confirmation,
          proposedSlots: availableSlots.map((slot) => ({
            start: slot.start,
            end: slot.end,
            score: slot.score,
          })),
        },
      });
    }

    console.log(`[RescheduleHandler] Email thread updated with new slots`);

    return {
      success: true,
      threadId: emailThread.threadId,
      responseMessageId: sentMessage.messageId ?? undefined,
    };
  } catch (error) {
    console.error(`[RescheduleHandler] Error:`, error);
    return {
      success: false,
      threadId: emailThread.threadId,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
