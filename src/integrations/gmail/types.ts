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
  participants: string[];
  messageCount: number;
  messages: Array<{
    id: string | null | undefined;
    snippet: string | null | undefined;
    body: string;
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
