/**
 * Email parsing utilities
 */

import { EMAIL_HEADERS } from "../constants";
import {
  extractEmailAddress,
  extractEmailAddresses,
  getHeaderValue,
  extractEmailBody,
  extractEmailBodies,
} from "../utils";
import type { ParsedEmailThread } from "../types";

/**
 * Extract participants from email messages
 */
function extractParticipants(
  messages: Array<{
    payload?: {
      headers?: Array<{ name?: string | null; value?: string | null }>;
    };
  }>
): Set<string> {
  const participants = new Set<string>();

  messages.forEach((msg) => {
    const headers = msg.payload?.headers;
    if (!headers) return;

    const fromHeader = getHeaderValue(headers, EMAIL_HEADERS.FROM);
    const toHeader = getHeaderValue(headers, EMAIL_HEADERS.TO);
    const ccHeader = getHeaderValue(headers, EMAIL_HEADERS.CC);

    if (fromHeader) {
      participants.add(extractEmailAddress(fromHeader));
    }

    if (toHeader) {
      extractEmailAddresses(toHeader).forEach((email) =>
        participants.add(email)
      );
    }

    if (ccHeader) {
      extractEmailAddresses(ccHeader).forEach((email) =>
        participants.add(email)
      );
    }
  });

  return participants;
}

/**
 * Parse individual email message details from Gmail message
 */
export function parseEmailMessage(message: {
  id?: string | null;
  snippet?: string | null;
  payload?: {
    headers?: Array<{ name?: string | null; value?: string | null }>;
    mimeType?: string | null;
    body?: { data?: string | null };
    parts?: Array<{
      mimeType?: string | null;
      body?: { data?: string | null };
      parts?: Array<any>;
    }>;
  };
}): {
  id: string;
  snippet: string | null;
  from: string;
  to: string;
  cc: string;
  subject: string;
  sentAt: Date;
  body: string;
  bodyText?: string;
  bodyHtml?: string;
} {
  const headers = message.payload?.headers || [];

  const from = getHeaderValue(headers, EMAIL_HEADERS.FROM);
  const to = getHeaderValue(headers, EMAIL_HEADERS.TO);
  const cc = getHeaderValue(headers, EMAIL_HEADERS.CC);
  const subject = getHeaderValue(headers, EMAIL_HEADERS.SUBJECT);
  const dateStr = getHeaderValue(headers, EMAIL_HEADERS.DATE);
  const bodies = extractEmailBodies(message.payload || {});
  const body = bodies.html || bodies.text || extractEmailBody(message.payload || {});

  // Parse the date string to Date object
  const sentAt = dateStr ? new Date(dateStr) : new Date();

  return {
    id: message.id || "",
    snippet: message.snippet || null,
    from: from || "",
    to: to || "",
    cc: cc || "",
    subject: subject || "",
    sentAt,
    body,
    bodyText: bodies.text || undefined,
    bodyHtml: bodies.html || undefined,
  };
}

/**
 * Parse email thread from Gmail API response
 */
export function parseEmailThread(thread: {
  id?: string | null;
  messages?: Array<{
    id?: string | null;
    snippet?: string | null;
    payload?: {
      headers?: Array<{ name?: string | null; value?: string | null }>;
      mimeType?: string | null;
      body?: { data?: string | null };
      parts?: Array<{
        mimeType?: string | null;
        body?: { data?: string | null };
        parts?: Array<any>;
      }>;
    };
  }>;
}): ParsedEmailThread {
  const messages = thread.messages || [];
  const firstMessage = messages[0];

  if (!firstMessage?.payload) {
    throw new Error("Invalid email thread: missing first message payload");
  }

  const headers = firstMessage.payload.headers || [];

  const subject = getHeaderValue(headers, EMAIL_HEADERS.SUBJECT);
  const from = getHeaderValue(headers, EMAIL_HEADERS.FROM);
  const to = getHeaderValue(headers, EMAIL_HEADERS.TO);
  const date = getHeaderValue(headers, EMAIL_HEADERS.DATE);

  const firstBodies = extractEmailBodies(firstMessage.payload);
  const body = firstBodies.html || firstBodies.text || extractEmailBody(firstMessage.payload);
  const participants = extractParticipants(messages);

  return {
    threadId: thread.id,
    subject,
    from,
    to,
    date,
    body,
    bodyText: firstBodies.text || undefined,
    bodyHtml: firstBodies.html || undefined,
    participants: Array.from(participants),
    messageCount: messages.length,
    messages: messages.map((msg) => parseEmailMessage(msg)),
  };
}
