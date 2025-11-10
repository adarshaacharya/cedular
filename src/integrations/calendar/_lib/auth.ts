/**
 * Calendar authentication and token management
 */

import { google } from "googleapis";
import prisma from "@/lib/prisma";
import { CALENDAR_API_VERSION, TOKEN_REFRESH_THRESHOLD_MS } from "../constants";
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
 * Refresh Calendar access token using refresh token
 */
export async function refreshCalendarToken(userId: string) {
  const userPreferences = await prisma.userPreferences.findUnique({
    where: { userId },
  });

  if (!userPreferences?.calendarRefreshToken) {
    throw new Error("No calendar refresh token available");
  }

  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: userPreferences.calendarRefreshToken,
  });

  try {
    const { credentials } = await oauth2Client.refreshAccessToken();

    await prisma.userPreferences.update({
      where: { userId },
      data: {
        calendarAccessToken: credentials.access_token || null,
        calendarRefreshToken:
          credentials.refresh_token || userPreferences.calendarRefreshToken,
        calendarTokenExpiry: credentials.expiry_date
          ? new Date(credentials.expiry_date)
          : null,
      },
    });

    return credentials;
  } catch (error) {
    console.error("Failed to refresh Calendar token:", error);
    throw new Error("Failed to refresh Calendar token");
  }
}

/**
 * Get authenticated Calendar client for a user
 * Automatically refreshes token if expired
 */
export async function getCalendarClient(userId: string) {
  const userPreferences = await prisma.userPreferences.findUnique({
    where: { userId },
  });

  if (
    !userPreferences?.calendarAccessToken ||
    !userPreferences?.calendarRefreshToken
  ) {
    throw new Error(
      "Calendar not connected. Please connect your Calendar account."
    );
  }

  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    access_token: userPreferences.calendarAccessToken,
    refresh_token: userPreferences.calendarRefreshToken,
    expiry_date: userPreferences.calendarTokenExpiry?.getTime(),
  });

  // Refresh token if expired or about to expire
  if (isTokenExpired(userPreferences.calendarTokenExpiry)) {
    await refreshCalendarToken(userId);

    const updated = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (updated?.calendarAccessToken) {
      oauth2Client.setCredentials({
        access_token: updated.calendarAccessToken,
        refresh_token: updated.calendarRefreshToken!,
        expiry_date: updated.calendarTokenExpiry?.getTime(),
      });
    }
  }

  return google.calendar({
    version: CALENDAR_API_VERSION,
    auth: oauth2Client,
  });
}

