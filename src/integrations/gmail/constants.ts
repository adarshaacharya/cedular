/**
 * Gmail integration constants
 */

export const GMAIL_API_VERSION = "v1" as const;
export const GMAIL_USER_ID = "me" as const;

// Token refresh threshold (5 minutes before expiry)
export const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

// Email headers
export const EMAIL_HEADERS = {
  FROM: "From",
  TO: "To",
  CC: "Cc",
  SUBJECT: "Subject",
  DATE: "Date",
} as const;

// MIME types
export const MIME_TYPES = {
  TEXT_PLAIN: "text/plain",
  TEXT_HTML: "text/html",
} as const;

// Gmail labels
export const GMAIL_LABELS = {
  INBOX: "INBOX",
  UNREAD: "UNREAD",
  SENT: "SENT",
} as const;

// Email content type
export const EMAIL_CONTENT_TYPE = "text/html; charset=utf-8";
