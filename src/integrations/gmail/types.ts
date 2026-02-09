/**
 * Gmail integration types
 */

export interface EmailMessagePayload {
  body?: { data?: string | null };
  parts?: Array<{
    mimeType?: string | null;
    body?: { data?: string | null };
  }>;
}

export interface ParsedEmailThread {
  threadId: string | null | undefined;
  subject: string;
  from: string;
  to: string;
  date: string;
  body: string;
  bodyText?: string;
  bodyHtml?: string;
  participants: string[];
  messageCount: number;
  messages: Array<{
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
  }>;
}

export interface SendEmailResult {
  messageId: string | null | undefined;
  threadId: string | null | undefined;
}

export interface PushNotificationResult {
  expiration: string;
  historyId: string;
}
