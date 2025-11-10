/**
 * Gmail authentication and token management
 */

import { google } from "googleapis";
import prisma from "@/lib/prisma";
import { env } from "@/env";
import {
  GMAIL_API_VERSION,
  GMAIL_USER_ID,
  TOKEN_REFRESH_THRESHOLD_MS,
} from "../constants";
import { createOAuth2Client } from "../utils";

/**
 * Check if token is expired or about to expire
 */
function isTokenExpired(expiryDate: Date | null | undefined): boolean {
  if (!expiryDate) return true;

  const now = Date.now();
  const expiryTime = expiryDate.getTime();
  return expiryTime - now < TOKEN_REFRESH_THRESHOLD_MS;
}

/**
 * Refresh Gmail access token using refresh token
 */
export async function refreshGmailToken(userId: string) {
  const userPreferences = await prisma.userPreferences.findUnique({
    where: { userId },
  });

  if (!userPreferences?.gmailRefreshToken) {
    throw new Error("No refresh token available");
  }

  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: userPreferences.gmailRefreshToken,
  });

  try {
    const { credentials } = await oauth2Client.refreshAccessToken();

    await prisma.userPreferences.update({
      where: { userId },
      data: {
        gmailAccessToken: credentials.access_token || null,
        gmailRefreshToken:
          credentials.refresh_token || userPreferences.gmailRefreshToken,
        gmailTokenExpiry: credentials.expiry_date
          ? new Date(credentials.expiry_date)
          : null,
      },
    });

    return credentials;
  } catch (error) {
    console.error("Failed to refresh Gmail token:", error);
    throw new Error("Failed to refresh Gmail token");
  }
}

/**
 * Get authenticated Gmail client for a user
 * Automatically refreshes token if expired
 */
export async function getGmailClient(userId: string) {
  const userPreferences = await prisma.userPreferences.findUnique({
    where: { userId },
  });

  if (
    !userPreferences?.gmailAccessToken ||
    !userPreferences?.gmailRefreshToken
  ) {
    throw new Error("Gmail not connected. Please connect your Gmail account.");
  }

  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    access_token: userPreferences.gmailAccessToken,
    refresh_token: userPreferences.gmailRefreshToken,
    expiry_date: userPreferences.gmailTokenExpiry?.getTime(),
  });

  // Refresh token if expired or about to expire
  if (isTokenExpired(userPreferences.gmailTokenExpiry)) {
    await refreshGmailToken(userId);

    const updated = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (updated?.gmailAccessToken) {
      oauth2Client.setCredentials({
        access_token: updated.gmailAccessToken,
        refresh_token: updated.gmailRefreshToken!,
        expiry_date: updated.gmailTokenExpiry?.getTime(),
      });
    }
  }

  return google.gmail({ version: GMAIL_API_VERSION, auth: oauth2Client });
}
