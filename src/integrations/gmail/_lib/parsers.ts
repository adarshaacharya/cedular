/**
 * Email parsing utilities
 */

import { EMAIL_HEADERS } from "../constants";
import {
  extractEmailAddress,
  extractEmailAddresses,
  getHeaderValue,
  extractEmailBody,
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
 * Parse email thread from Gmail API response
 */
export function parseEmailThread(thread: {
  id?: string | null;
  messages?: Array<{
    id?: string | null;
    snippet?: string | null;
    payload?: {
      headers?: Array<{ name?: string | null; value?: string | null }>;
      body?: { data?: string | null };
      parts?: Array<{
        mimeType?: string | null;
        body?: { data?: string | null };
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

  const body = extractEmailBody(firstMessage.payload);
  const participants = extractParticipants(messages);

  return {
    threadId: thread.id,
    subject,
    from,
    to,
    date,
    body,
    participants: Array.from(participants),
    messageCount: messages.length,
    messages: messages.map((msg) => ({
      id: msg.id,
      snippet: msg.snippet,
      body: extractEmailBody(msg.payload || {}),
    })),
  };
}
