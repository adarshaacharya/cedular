/**
 * Gmail utility functions
 */

import { google } from "googleapis";
import { env } from "@/env";
import { EMAIL_HEADERS, MIME_TYPES } from "./constants";

/**
 * Extract email address from header value
 * Handles formats like "Name <email@example.com>" or "email@example.com"
 */
export function extractEmailAddress(headerValue: string): string {
  const emailMatch = headerValue.match(/<(.+)>/);
  return emailMatch ? emailMatch[1] : headerValue.trim();
}

/**
 * Extract all email addresses from a comma-separated header value
 */
export function extractEmailAddresses(headerValue: string): string[] {
  return headerValue
    .split(",")
    .map((addr) => extractEmailAddress(addr))
    .filter(Boolean);
}

/**
 * Get header value from message payload
 */
export function getHeaderValue(
  headers: Array<{ name?: string | null; value?: string | null }> | undefined,
  headerName: string
): string {
  return headers?.find((h) => h.name === headerName)?.value?.trim() || "";
}

/**
 * Extract email body from message payload
 * Handles both simple and multipart messages
 */
export function extractEmailBody(payload: {
  body?: { data?: string | null };
  parts?: Array<{
    mimeType?: string | null;
    body?: { data?: string | null };
  }>;
}): string {
  // Simple message with body
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, "base64").toString("utf-8");
  }

  // Multipart message - find text part
  if (payload.parts) {
    const textPart = payload.parts.find(
      (p) =>
        p.mimeType === MIME_TYPES.TEXT_PLAIN ||
        p.mimeType === MIME_TYPES.TEXT_HTML
    );

    if (textPart?.body?.data) {
      return Buffer.from(textPart.body.data, "base64").toString("utf-8");
    }
  }

  return "";
}

/**
 * Encode email message to base64url format (Gmail API requirement)
 */
export function encodeEmailMessage(email: string): string {
  return Buffer.from(email)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Create OAuth2 client with credentials
 */
export function createOAuth2Client() {
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI
  );
}
