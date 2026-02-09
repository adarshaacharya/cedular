import { HandlerInput, HandlerOutput } from "./types";
import { runCalendarAgent } from "@/agents/calendar-agent";
import { sendEmail } from "@/integrations/gmail";
import { extractEmailAddresses } from "@/integrations/gmail/utils";
import {
  createEmailThread,
  saveEmailMessages,
} from "@/services/email-thread-service";
import {
  EmailThreadIntent,
  EmailThreadStatus,
} from "@/prisma/generated/prisma/enums";
import prisma from "@/lib/prisma";
import {
  formatDateInTimeZone,
  formatTimeInTimeZone,
  getZonedParts,
} from "@/lib/timezone";

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

    const requestedDate = parsedIntent.requestedDate || null; // YYYY-MM-DD in user's timezone

    // 2. Find optimal calendar slots
    const calendarAgentInput = {
      participants: emailThread.participants || [emailThread.from],
      duration: parsedIntent.duration || 60,
      preferences: {
        timezone: scheduleProfile?.timezone || "UTC",
        workingHoursStart: scheduleProfile?.workingHoursStart || "09:00",
        workingHoursEnd: scheduleProfile?.workingHoursEnd || "17:00",
        bufferMinutes: scheduleProfile?.bufferMinutes || 15,
        ...(requestedDate ? { startDate: requestedDate, daysToCheck: 1 } : {}),
      },
    };
    const timezone = calendarAgentInput.preferences.timezone;

    let calendarResult = await runCalendarAgent(calendarAgentInput, userId);

    // Extract slots directly from structured output
    let availableSlots = calendarResult.output.slots;

    // Safety: if user requested a specific date, enforce it even if the agent ignored it.
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

    // If a specific date was requested but we found no slots, fall back to "next best" slots.
    // This avoids sending an empty/failed response when the request is too constrained.
    let usedFallback = false;
    if (requestedDate && (!availableSlots || availableSlots.length === 0)) {
      usedFallback = true;
      const fallbackResult = await runCalendarAgent(
        {
          participants: calendarAgentInput.participants,
          duration: calendarAgentInput.duration,
          preferences: {
            timezone: calendarAgentInput.preferences.timezone,
            workingHoursStart: calendarAgentInput.preferences.workingHoursStart,
            workingHoursEnd: calendarAgentInput.preferences.workingHoursEnd,
            bufferMinutes: calendarAgentInput.preferences.bufferMinutes,
          },
        },
        userId
      );
      calendarResult = fallbackResult;
      availableSlots = fallbackResult.output.slots;
    }

    if (!availableSlots || availableSlots.length === 0) {
      console.log(`[ScheduleHandler] No available slots found by agent`);
    } else {
      console.log(
        `[ScheduleHandler] Found ${availableSlots.length} slots from structured agent output`
      );
    }

    let topSlots: Array<{ start: string; end: string; score?: number }> = [];
    if (availableSlots && availableSlots.length > 0) {
      // Sort by score (highest first) and take top 3
      const sortedSlots = [...availableSlots].sort(
        (a, b) => (b.score ?? 0) - (a.score ?? 0)
      );
      topSlots = sortedSlots.slice(0, 3);
      console.log(
        `[ScheduleHandler] Using top ${topSlots.length} scored slots`
      );
    }
    console.log("[ScheduleHandler][Debug] topSlots:", topSlots);

    if (topSlots.length > 0) {
      // 4. Deterministic response email with correctly formatted dates/times in the user's timezone.
      const slotLis = topSlots
        .map((slot, i) => {
          const start = new Date(slot.start);
          const end = new Date(slot.end);
          const date = formatDateInTimeZone(start, timezone);
          const startTime = formatTimeInTimeZone(start, timezone);
          const endTime = formatTimeInTimeZone(end, timezone);
          return `<li><strong>Option ${i + 1}:</strong> ${date}, ${startTime} - ${endTime} (${timezone})</li>`;
        })
        .join("\n");

      const dateNote =
        requestedDate && usedFallback
          ? `<p><strong>Note:</strong> I couldn't find availability on <strong>${requestedDate}</strong> in ${timezone}, so I’m suggesting the next best options.</p>`
          : "";

      const generatedResponse = `
<p>Hi ${senderName || "there"},</p>
<p>Thank you for your request to schedule a meeting.</p>
${dateNote}
<p>Here are some available time slots in <strong>${timezone}</strong>:</p>
<ul>
${slotLis}
</ul>
<p>Please reply with “Option 1”, “Option 2”, or “Option 3” (or paste the time) and I’ll send a calendar invite.</p>
<p>Best regards,<br />${assistantName || "Assistant"}</p>
`;

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
      const savedThread = await createEmailThread({
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

      // 7. Save email message history
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

        await saveEmailMessages(savedThread.id, messagesToSave);
        console.log(
          `[ScheduleHandler] Saved ${messagesToSave.length} email messages`
        );
      } catch (error) {
        console.error(
          `[ScheduleHandler] Error saving email messages: ${error}`
        );
        // Don't fail the workflow for message saving errors
      }

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
