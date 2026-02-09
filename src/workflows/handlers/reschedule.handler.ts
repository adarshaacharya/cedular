import { HandlerInput, HandlerOutput } from "./types";
import { runCalendarAgent } from "@/agents/calendar-agent";
import { generateResponse } from "@/agents/response-generator";
import { sendEmail } from "@/integrations/gmail";
import { extractEmailAddresses } from "@/integrations/gmail/utils";
import prisma from "@/lib/prisma";
import { EmailThreadStatus } from "@/prisma/generated/prisma/enums";
import { getZonedParts } from "@/lib/timezone";
import { saveEmailMessage, saveEmailMessages } from "@/services/email-thread-service";
import { syncGmailThreadMessagesToDb } from "@/services/gmail-thread-sync";

export async function handleReschedule(
  input: HandlerInput
): Promise<HandlerOutput> {
  const { emailThread, parsedIntent, userId, senderName, assistantName } =
    input;

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

    // 2. Fetch user schedule profile for preferences
    const scheduleProfile = await prisma.userScheduleProfile.findUnique({
      where: { userId },
    });

    const requestedDate = parsedIntent.requestedDate || null; // YYYY-MM-DD in user's timezone

    // 3. Find new optimal calendar slots
    console.log(`[RescheduleHandler] Finding new available slots`);
    const calendarResult = await runCalendarAgent(
      {
        participants: parsedIntent.participants || [],
        duration: parsedIntent.duration || 60,
        preferences: {
          timezone: scheduleProfile?.timezone || "UTC",
          workingHoursStart: scheduleProfile?.workingHoursStart || "09:00",
          workingHoursEnd: scheduleProfile?.workingHoursEnd || "17:00",
          bufferMinutes: scheduleProfile?.bufferMinutes || 15,
          ...(requestedDate ? { startDate: requestedDate, daysToCheck: 1 } : {}),
        },
      },
      userId
    );

    const timezone = scheduleProfile?.timezone || "UTC";
    let availableSlots = calendarResult.output.slots;

    // Safety: enforce requested date if present.
    if (requestedDate) {
      const toIsoDate = (d: Date) => {
        const p = getZonedParts(d, timezone);
        return `${p.year}-${String(p.month).padStart(2, "0")}-${String(
          p.day
        ).padStart(2, "0")}`;
      };
      availableSlots = availableSlots.filter(
        (s) => toIsoDate(new Date(s.start)) === requestedDate
      );
    }

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

    // 4. Format slots for response generator
    const slotsFormatted = availableSlots.reduce((acc, slot) => {
      acc[`${slot.start} - ${slot.end}`] = slot.score.toString();
      return acc;
    }, {} as Record<string, string>);

    // 5. Generate response email with new proposed times
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

    // 6. Send email
    console.log(`[RescheduleHandler] Sending reschedule response`);
    const latestMessageId =
      emailThread.messages[emailThread.messages.length - 1]?.id;

    const replySubject = `Re: ${emailThread.subject.replace(/^Re:\s*/i, "")}`;
    const sentMessage = await sendEmail({
      to: emailThread.from,
      body: generatedResponse,
      userId,
      subject: replySubject,
      threadId: emailThread.threadId,
      messageId: latestMessageId,
    });

    console.log(
      `[RescheduleHandler] Response email sent: ${sentMessage.messageId}`
    );

    // Persist inbound + outgoing messages so the UI shows the full conversation.
    if (dbThread) {
      try {
        const messagesToSave = emailThread.messages.map((msg) => ({
          gmailMessageId: msg.id,
          from: msg.from,
          to: extractEmailAddresses(msg.to),
          cc: extractEmailAddresses(msg.cc),
          subject: msg.subject,
          body: msg.body,
          snippet: msg.snippet || undefined,
          sentAt: msg.sentAt,
        }));
        await saveEmailMessages(dbThread.id, messagesToSave);
      } catch (e) {
        console.error(`[RescheduleHandler] Error saving inbound messages:`, e);
      }

      try {
        if (sentMessage.messageId) {
          await saveEmailMessage({
            emailThreadId: dbThread.id,
            gmailMessageId: sentMessage.messageId,
            from: input.userPreferences.assistantEmail || "assistant",
            to: [emailThread.from],
            cc: [],
            subject: replySubject,
            body: generatedResponse,
            bodyHtml: generatedResponse,
            snippet: undefined,
            sentAt: new Date(),
          });
        }
      } catch (e) {
        console.error(`[RescheduleHandler] Error saving outgoing message:`, e);
      }
    }

    // Canonical sync with Gmail so DB matches the mailbox.
    try {
      await syncGmailThreadMessagesToDb({
        userId,
        threadId: emailThread.threadId,
        emailThreadDbId: dbThread?.id,
      });
    } catch (e) {
      console.error(`[RescheduleHandler] Thread sync failed:`, e);
    }

    // 7. Update email thread with new proposed slots
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
