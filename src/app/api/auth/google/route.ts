/**
 * Google OAuth Initiation Endpoint
 *
 * Redirects user to Google OAuth consent screen with required scopes:
 * - Gmail readonly access
 * - Calendar access
 */

import { NextResponse } from "next/server";
import { google } from "googleapis";
import { env } from "@/env";
import { auth } from "@/lib/auth/server";
import logger from "@/lib/logger";

// Required scopes for Gmail and Calendar access
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send", // Send emails on behalf of user
  "https://www.googleapis.com/auth/calendar",
];

export async function GET(request: Request) {
  try {
    // Get current user session
    const session = await auth.api.getSession({
      headers: new Headers(request.headers),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in first." },
        { status: 401 }
      );
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI
    );

    // Generate authorization URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline", // Required to get refresh token
      scope: SCOPES,
      prompt: "consent select_account", // Force consent screen to get refresh token
      state: session.user.id, // Pass user ID in state for security
    });

    // Redirect to Google OAuth
    return NextResponse.redirect(authUrl);
  } catch (error) {
    logger.error({ error }, "Failed to initiate Google OAuth");
    return NextResponse.json(
      {
        error: "Failed to initiate Google OAuth",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
