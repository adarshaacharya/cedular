/**
 * Gmail API Integration
 *
 * Provides functions to interact with Gmail API:
 * - Fetch email threads
 * - Send emails
 * - Manage push notifications
 */

import { GMAIL_USER_ID, GMAIL_LABELS, EMAIL_CONTENT_TYPE } from "./constants";
import { getGmailClient } from "./_lib/auth";
import { parseEmailThread } from "./_lib/parsers";
import { encodeEmailMessage } from "./utils";
import type {
  ParsedEmailThread,
  SendEmailResult,
  PushNotificationResult,
} from "./types";

/**
 * Fetch the latest unread email thread from inbox
 */
export async function fetchLatestUnreadThread(
  userId: string
): Promise<ParsedEmailThread | null> {
  const gmail = await getGmailClient(userId);

  try {
    // List threads with UNREAD label
    const listResponse = await gmail.users.threads.list({
      userId: GMAIL_USER_ID,
      labelIds: [GMAIL_LABELS.INBOX, GMAIL_LABELS.UNREAD],
      maxResults: 1,
    });

    const threads = listResponse.data.threads;
    if (!threads || threads.length === 0) {
      return null;
    }

    const threadId = threads[0].id;
    if (!threadId) {
      return null;
    }

    // Fetch the full thread
    const response = await gmail.users.threads.get({
      userId: GMAIL_USER_ID,
      id: threadId,
      format: "full",
    });

    return parseEmailThread(response.data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch latest unread thread: ${errorMessage}`);
  }
}

/**
 * Fetch email thread from Gmail by ID
 */
export async function fetchEmailThread(
  threadId: string,
  userId: string
): Promise<ParsedEmailThread> {
  const gmail = await getGmailClient(userId);

  try {
    const response = await gmail.users.threads.get({
      userId: GMAIL_USER_ID,
      id: threadId,
      format: "full",
    });

    return parseEmailThread(response.data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch email thread: ${errorMessage}`);
  }
}

/**
 * Send email via Gmail
 */
export async function sendEmail(
  to: string,
  body: string,
  threadId: string | null,
  userId: string,
  subject?: string
): Promise<SendEmailResult> {
  const gmail = await getGmailClient(userId);

  try {
    const profile = await gmail.users.getProfile({ userId: GMAIL_USER_ID });
    const fromEmail = profile.data.emailAddress;

    if (!fromEmail) {
      throw new Error("Could not get user email address");
    }

    const emailSubject = subject || "Re:";
    const emailLines = [
      `To: ${to}`,
      `From: ${fromEmail}`,
      `Subject: ${emailSubject}`,
      `Content-Type: ${EMAIL_CONTENT_TYPE}`,
      "",
      body,
    ];

    const email = emailLines.join("\r\n");
    const encodedMessage = encodeEmailMessage(email);

    const message: {
      raw: string;
      threadId?: string;
    } = {
      raw: encodedMessage,
    };

    if (threadId) {
      message.threadId = threadId;
    }

    const response = await gmail.users.messages.send({
      userId: GMAIL_USER_ID,
      requestBody: message,
    });

    return {
      messageId: response.data.id,
      threadId: response.data.threadId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to send email: ${errorMessage}`);
  }
}

/**
 * Set up Gmail push notifications (webhooks)
 */
export async function setupPushNotifications(
  userId: string,
  topic: string
): Promise<PushNotificationResult> {
  const gmail = await getGmailClient(userId);

  try {
    const response = await gmail.users.watch({
      userId: GMAIL_USER_ID,
      requestBody: {
        topicName: topic,
        labelIds: [GMAIL_LABELS.INBOX],
      },
    });

    return {
      expiration: response.data.expiration || "",
      historyId: response.data.historyId || "",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to set up push notifications: ${errorMessage}`);
  }
}

/**
 * Stop Gmail push notifications
 */
export async function stopPushNotifications(userId: string): Promise<void> {
  const gmail = await getGmailClient(userId);

  try {
    await gmail.users.stop({
      userId: GMAIL_USER_ID,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to stop push notifications: ${errorMessage}`);
  }
}

/**
 * Mark email thread as read (removes UNREAD label)
 */
export async function markThreadAsRead(
  threadId: string,
  userId: string
): Promise<void> {
  const gmail = await getGmailClient(userId);

  try {
    await gmail.users.threads.modify({
      userId: GMAIL_USER_ID,
      id: threadId,
      requestBody: {
        removeLabelIds: [GMAIL_LABELS.UNREAD],
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to mark thread as read: ${errorMessage}`);
  }
}

// Re-export auth functions
export { getGmailClient, refreshGmailToken } from "./_lib/auth";

// Re-export history functions
export { getHistorySinceId, getCurrentHistoryId } from "./history";
export type { HistoryEvent, HistoryResult } from "./history";
