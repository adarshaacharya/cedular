import { HandlerInput, HandlerOutput } from "./types";
import { createCalendarEvent } from "@/integrations/calendar";
import { sendEmail } from "@/integrations/gmail";
import { extractEmailAddresses } from "@/integrations/gmail/utils";
import prisma from "@/lib/prisma";
import { createMeetingFromEmailThread } from "@/services/meetings-service";
import {
  saveEmailMessage,
  saveEmailMessages,
} from "@/services/email-thread-service";
import { syncGmailThreadMessagesToDb } from "@/services/gmail-thread-sync";
import {
  EmailThreadStatus,
  MeetingStatus,
  MeetingSource,
} from "@/prisma/generated/prisma/enums";
import { formatDateInTimeZone, formatTimeInTimeZone } from "@/lib/timezone";

interface ProposedSlot {
  start: string;
  end: string;
  score: number;
  reason: string;
}

export async function handleConfirm(
  input: HandlerInput
): Promise<HandlerOutput> {
  const { emailThread, parsedIntent, userId, userPreferences, assistantName } =
    input;

  try {
    console.log(
      `[ConfirmHandler] Processing confirmation for thread: ${emailThread.threadId}`
    );

    // 1. Fetch email thread from DB (get proposedSlots)
    const dbThread = await prisma.emailThread.findUnique({
      where: { threadId: emailThread.threadId },
    });

    if (!dbThread) {
      console.error(
        `[ConfirmHandler] Thread not found in DB: ${emailThread.threadId}`
      );
      return {
        success: false,
        threadId: emailThread.threadId,
        error: "Email thread not found in database",
      };
    }

    const proposedSlots = dbThread.proposedSlots as ProposedSlot[] | null;

    if (!proposedSlots || proposedSlots.length === 0) {
      console.error(
        `[ConfirmHandler] No proposed slots found for thread: ${emailThread.threadId}`
      );
      return {
        success: false,
        threadId: emailThread.threadId,
        error: "No proposed slots found",
      };
    }

    // 2. Get chosen slot using parsedIntent.chosenSlotIndex
    const chosenIndex = parsedIntent.chosenSlotIndex ?? 0;
    const chosenSlot = proposedSlots[chosenIndex];

    if (!chosenSlot) {
      console.error(`[ConfirmHandler] Invalid slot index: ${chosenIndex}`);
      return {
        success: false,
        threadId: emailThread.threadId,
        error: `Invalid slot index: ${chosenIndex}`,
      };
    }

    console.log(
      `[ConfirmHandler] Chosen slot: ${chosenSlot.start} - ${chosenSlot.end}`
    );

    // Fetch user schedule profile for timezone
    const scheduleProfile = await prisma.userScheduleProfile.findUnique({
      where: { userId },
    });

    const timezone = scheduleProfile?.timezone || "UTC";

    // 3. Call createCalendarEvent()
    const calendarEvent = await createCalendarEvent(
      {
        summary: dbThread.subject || "Meeting",
        description: `Scheduled via ${assistantName}`,
        start: {
          dateTime: chosenSlot.start,
          timeZone: timezone,
        },
        end: {
          dateTime: chosenSlot.end,
          timeZone: timezone,
        },
        attendees: (dbThread.participants || []).map((email) => ({ email })),
      },
      userId
    );

    console.log(`[ConfirmHandler] Calendar event created: ${calendarEvent.id}`);

    // 4. Save to meetings table
    const meeting = await createMeetingFromEmailThread({
      emailThreadId: dbThread.id,
      title: dbThread.subject || "Meeting",
      description: `Scheduled via ${assistantName}`,
      participants: dbThread.participants || [],
      startTime: new Date(chosenSlot.start),
      endTime: new Date(chosenSlot.end),
      timezone: timezone,
      calendarEventId: calendarEvent.id || undefined,
      meetingLink:
        calendarEvent.conferenceData?.entryPoints?.[0]?.uri || undefined,
      status: MeetingStatus.confirmed,
      source: MeetingSource.email_thread,
    });

    console.log(`[ConfirmHandler] Meeting saved: ${meeting.id}`);

    // 5. Update email thread status to "confirmed"
    await prisma.emailThread.update({
      where: { id: dbThread.id },
      data: { status: EmailThreadStatus.confirmed },
    });

    // Persist the latest incoming message(s) for this thread (e.g. the user's "Option 1" reply).
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
      console.error(`[ConfirmHandler] Error saving inbound messages:`, e);
    }

    // 6. Generate & send confirmation email
    const startDate = new Date(chosenSlot.start);
    const formattedDate = formatDateInTimeZone(startDate, timezone);
    const formattedTime = formatTimeInTimeZone(startDate, timezone);

    const participantsList = (dbThread.participants || []).join(", ");
    const confirmationBody = `
<p>Great news! Your meeting has been confirmed.</p>
<p><strong>Meeting Details:</strong></p>
<ul>
  <li><strong>Title:</strong> ${dbThread.subject || "Meeting"}</li>
  <li><strong>Date:</strong> ${formattedDate}</li>
  <li><strong>Time:</strong> ${formattedTime} (${timezone})</li>
  <li><strong>Participants:</strong> ${participantsList || "You"}</li>
</ul>
<p>Calendar invites have been sent to all participants.</p>
<p>Best regards,<br />${assistantName}</p>
`;

    const replySubject = `Re: ${emailThread.subject}`;
    const sentMessage = await sendEmail({
      to: emailThread.from,
      body: confirmationBody,
      userId,
      subject: replySubject,
      threadId: emailThread.threadId,
      messageId: emailThread.messages[emailThread.messages.length - 1]?.id,
    });

    console.log(
      `[ConfirmHandler] Confirmation email sent: ${sentMessage.messageId}`
    );

    // Persist outgoing confirmation message for UI visibility.
    try {
      if (sentMessage.messageId) {
        await saveEmailMessage({
          emailThreadId: dbThread.id,
          gmailMessageId: sentMessage.messageId,
          from: userPreferences.assistantEmail || "assistant",
          to: [emailThread.from],
          cc: [],
          subject: replySubject,
          body: confirmationBody,
          bodyHtml: confirmationBody,
          snippet: undefined,
          sentAt: new Date(),
        });
      }
    } catch (e) {
      console.error(`[ConfirmHandler] Error saving outgoing message:`, e);
    }

    // Canonical sync with Gmail so DB matches the mailbox (captures the sent message + headers as Gmail stored them).
    try {
      await syncGmailThreadMessagesToDb({
        userId,
        threadId: emailThread.threadId,
        emailThreadDbId: dbThread.id,
      });
    } catch (e) {
      console.error(`[ConfirmHandler] Thread sync failed:`, e);
    }

    // 7. Return result
    return {
      success: true,
      threadId: emailThread.threadId,
      responseMessageId: sentMessage.messageId ?? undefined,
    };
  } catch (error) {
    console.error(`[ConfirmHandler] Error:`, error);
    return {
      success: false,
      threadId: emailThread.threadId,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
