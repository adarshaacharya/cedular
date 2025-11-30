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

export interface SendEmailOptions {
  to: string;
  body: string;
  userId: string;
  subject?: string;
  threadId?: string | null;
  messageId?: string | null; // For proper reply threading
}

/**
 * Send email via Gmail
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  const gmail = await getGmailClient(options.userId);

  try {
    const profile = await gmail.users.getProfile({ userId: GMAIL_USER_ID });
    const fromEmail = profile.data.emailAddress;

    if (!fromEmail) {
      throw new Error("Could not get user email address");
    }

    const emailSubject = options.subject || "Re:";

    // Generate a unique Message-ID for the new email
    const messageId = `<${Date.now()}.${Math.random()
      .toString(36)
      .substring(2)}@${fromEmail.split("@")[1]}>`;

    // Create boundary for multipart MIME message
    const boundary = `----=_Part_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2)}`;

    // Build email headers for multipart/alternative
    let emailHeaders = `Message-ID: ${messageId}\r\n`;
    emailHeaders += `To: ${options.to}\r\n`;
    emailHeaders += `From: ${fromEmail}\r\n`;
    emailHeaders += `Subject: ${emailSubject}\r\n`;
    emailHeaders += `MIME-Version: 1.0\r\n`;
    emailHeaders += `Content-Type: multipart/alternative; boundary="${boundary}"\r\n`;

    // Add proper reply headers if replying to a message
    if (options.messageId) {
      // Format messageId for email headers (ensure it's in angle brackets)
      const replyToId = options.messageId.startsWith("<")
        ? options.messageId
        : `<${options.messageId}>`;
      emailHeaders += `In-Reply-To: ${replyToId}\r\n`;
      emailHeaders += `References: ${replyToId}\r\n`;
    }

    // Create plain text version (strip HTML tags for fallback)
    const plainTextBody = options.body
      .replace(/<[^>]*>/g, " ") // Remove HTML tags
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    // Build multipart MIME body with both plain text and HTML versions
    const mimeBody = `${emailHeaders}\r\n--${boundary}\r\nContent-Type: text/plain; charset="UTF-8"\r\nContent-Transfer-Encoding: base64\r\n\r\n${Buffer.from(
      plainTextBody
    ).toString(
      "base64"
    )}\r\n--${boundary}\r\nContent-Type: text/html; charset="UTF-8"\r\nContent-Transfer-Encoding: base64\r\n\r\n${Buffer.from(
      options.body
    ).toString("base64")}\r\n--${boundary}--`;

    const encodedMessage = encodeEmailMessage(mimeBody);

    const message: {
      raw: string;
      threadId?: string;
    } = {
      raw: encodedMessage,
    };

    if (options.threadId) {
      message.threadId = options.threadId;
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
