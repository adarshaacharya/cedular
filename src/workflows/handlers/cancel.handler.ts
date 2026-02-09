import { HandlerInput, HandlerOutput } from "./types";
import { sendEmail } from "@/integrations/gmail";
import { extractEmailAddresses } from "@/integrations/gmail/utils";
import prisma from "@/lib/prisma";
import {
  saveEmailMessage,
  saveEmailMessages,
} from "@/services/email-thread-service";
import { syncGmailThreadMessagesToDb } from "@/services/gmail-thread-sync";
import {
  EmailThreadStatus,
  MeetingStatus,
} from "@/prisma/generated/prisma/enums";

export async function handleCancel(
  input: HandlerInput
): Promise<HandlerOutput> {
  const { emailThread, userId, assistantName } = input;

  try {
    console.log(
      `[CancelHandler] Processing cancellation for thread: ${emailThread.threadId}`
    );

    // 1. Fetch email thread from DB
    const dbThread = await prisma.emailThread.findUnique({
      where: { threadId: emailThread.threadId },
      include: { meetings: true },
    });

    if (!dbThread) {
      console.warn(
        `[CancelHandler] Thread not found in DB: ${emailThread.threadId}`
      );
      return {
        success: false,
        threadId: emailThread.threadId,
        error: "Email thread not found in database",
      };
    }

    // 2. Cancel the meetings if they exist
    if (dbThread.meetings && dbThread.meetings.length > 0) {
      const latestMeeting = dbThread.meetings[dbThread.meetings.length - 1];
      console.log(`[CancelHandler] Cancelling meeting: ${latestMeeting.id}`);

      // TODO: Delete calendar event if needed
      // await deleteCalendarEvent(latestMeeting.calendarEventId, userId);

      await prisma.meeting.update({
        where: { id: latestMeeting.id },
        data: { status: MeetingStatus.cancelled },
      });

      console.log(`[CancelHandler] Meeting status updated to cancelled`);
    }

    // 3. Update email thread status
    await prisma.emailThread.update({
      where: { id: dbThread.id },
      data: { status: EmailThreadStatus.failed }, // or add a 'cancelled' status
    });

    // Persist the latest inbound messages (e.g. "cancel" request reply).
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
      console.error(`[CancelHandler] Error saving inbound messages:`, e);
    }

    // 4. Send cancellation confirmation email
    const cancellationBody = `
<p>Your meeting has been cancelled as requested.</p>
<p><strong>Cancelled Meeting:</strong> ${dbThread.subject || "Meeting"}</p>
<p>If you'd like to reschedule, please reply to this email with your preferred times.</p>
<p>Best regards,<br />${assistantName}</p>
`;

    const latestMessageId =
      emailThread.messages[emailThread.messages.length - 1]?.id;

    const replySubject = `Re: ${emailThread.subject}`;
    const sentMessage = await sendEmail({
      to: emailThread.from,
      body: cancellationBody,
      userId,
      subject: replySubject,
      threadId: emailThread.threadId,
      messageId: latestMessageId,
    });

    console.log(
      `[CancelHandler] Cancellation email sent: ${sentMessage.messageId}`
    );

    // Persist outgoing cancellation message for UI visibility.
    try {
      if (sentMessage.messageId) {
        await saveEmailMessage({
          emailThreadId: dbThread.id,
          gmailMessageId: sentMessage.messageId,
          from: input.userPreferences.assistantEmail || "assistant",
          to: [emailThread.from],
          cc: [],
          subject: replySubject,
          body: cancellationBody,
          bodyHtml: cancellationBody,
          snippet: undefined,
          sentAt: new Date(),
        });
      }
    } catch (e) {
      console.error(`[CancelHandler] Error saving outgoing message:`, e);
    }

    // Canonical sync with Gmail so DB matches the mailbox.
    try {
      await syncGmailThreadMessagesToDb({
        userId,
        threadId: emailThread.threadId,
        emailThreadDbId: dbThread.id,
      });
    } catch (e) {
      console.error(`[CancelHandler] Thread sync failed:`, e);
    }

    return {
      success: true,
      threadId: emailThread.threadId,
      responseMessageId: sentMessage.messageId ?? undefined,
    };
  } catch (error) {
    console.error(`[CancelHandler] Error:`, error);
    return {
      success: false,
      threadId: emailThread.threadId,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
