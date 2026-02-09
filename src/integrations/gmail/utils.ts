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
 * Extract name from email header value
 * Handles formats like "Name <email@example.com>" or "email@example.com"
 */
export function extractEmailName(headerValue: string): string {
  const nameMatch = headerValue.match(/^([^<]+)</);
  if (nameMatch) {
    return nameMatch[1].trim();
  }
  // If no name part, extract username from email
  const emailMatch = headerValue.match(/([^@]+)@/);
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
  const bodies = extractEmailBodies(payload);
  // Prefer HTML if present for back-compat (previous UI assumed HTML).
  return bodies.html || bodies.text || "";
}

function decodeGmailBase64(data: string): string {
  // Gmail uses base64url in many places; normalize to standard base64.
  const normalized = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf-8");
}

function walkParts(
  parts: Array<{
    mimeType?: string | null;
    body?: { data?: string | null };
    parts?: any[];
  }>,
  acc: { text?: string; html?: string }
) {
  for (const p of parts) {
    if (p?.parts && Array.isArray(p.parts)) {
      walkParts(p.parts, acc);
      continue;
    }

    const mime = p?.mimeType || "";
    const data = p?.body?.data || null;
    if (!data) continue;

    if (!acc.html && mime === MIME_TYPES.TEXT_HTML) {
      acc.html = decodeGmailBase64(data);
    } else if (!acc.text && mime === MIME_TYPES.TEXT_PLAIN) {
      acc.text = decodeGmailBase64(data);
    }

    if (acc.text && acc.html) return;
  }
}

export function extractEmailBodies(payload: {
  body?: { data?: string | null };
  mimeType?: string | null;
  parts?: Array<{
    mimeType?: string | null;
    body?: { data?: string | null };
    parts?: any[];
  }>;
}): { text: string | null; html: string | null } {
  // Simple message with body (mimeType often omitted here; treat as text).
  if (payload.body?.data) {
    const decoded = decodeGmailBase64(payload.body.data);
    // If we know it's HTML, store it as HTML; otherwise store as text.
    const mime = payload.mimeType || "";
    if (mime === MIME_TYPES.TEXT_HTML) return { text: null, html: decoded };
    return { text: decoded, html: null };
  }

  const acc: { text?: string; html?: string } = {};
  if (payload.parts && Array.isArray(payload.parts)) {
    walkParts(payload.parts as any[], acc);
  }

  return {
    text: acc.text ?? null,
    html: acc.html ?? null,
  };
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
    env.GOOGLE_SERVICES_REDIRECT_URI
  );
}
