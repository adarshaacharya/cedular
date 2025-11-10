/**
 * Google OAuth Callback Handler
 *
 * Handles the OAuth callback from Google:
 * 1. Extracts code and state from URL
 * 2. Verifies state matches user ID
 * 3. Exchanges code for access/refresh tokens
 * 4. Stores tokens in user_preferences table
 * 5. Redirects to dashboard
 */

import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { env } from "@/env";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle OAuth errors from Google
    if (error) {
      logger.error({ error }, "Google OAuth error");
      return NextResponse.redirect(
        new URL("/dashboard?error=oauth_denied", request.url)
      );
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/dashboard?error=missing_params", request.url)
      );
    }

    // Verify user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.redirect(
        new URL("/sign-in?error=session_expired", request.url)
      );
    }

    // Verify state matches user ID (security check)
    if (state !== session.user.id) {
      logger.error(
        { state, userId: session.user.id },
        "OAuth state mismatch - potential security issue"
      );
      return NextResponse.redirect(
        new URL("/dashboard?error=invalid_state", request.url)
      );
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error("Failed to get tokens from Google");
    }

    // Calculate token expiry date
    const expiryDate = tokens.expiry_date ? new Date(tokens.expiry_date) : null;

    // Store tokens in user_preferences
    // Note: Gmail and Calendar use the same tokens when using same Google account
    await prisma.userPreferences.upsert({
      where: {
        userId: session.user.id,
      },
      create: {
        userId: session.user.id,
        gmailAccessToken: tokens.access_token,
        gmailRefreshToken: tokens.refresh_token,
        gmailTokenExpiry: expiryDate,
        calendarAccessToken: tokens.access_token, // Same token for both
        calendarRefreshToken: tokens.refresh_token,
        calendarTokenExpiry: expiryDate,
        timezone: "UTC", // Default, user can update later
      },
      update: {
        gmailAccessToken: tokens.access_token,
        gmailRefreshToken: tokens.refresh_token,
        gmailTokenExpiry: expiryDate,
        calendarAccessToken: tokens.access_token,
        calendarRefreshToken: tokens.refresh_token,
        calendarTokenExpiry: expiryDate,
      },
    });

    // Success! Redirect to dashboard
    return NextResponse.redirect(
      new URL("/dashboard?success=google_connected", request.url)
    );
  } catch (error) {
    logger.error({ error }, "OAuth callback error");
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.redirect(
      new URL(
        `/dashboard?error=oauth_failed&message=${encodeURIComponent(
          errorMessage
        )}`,
        request.url
      )
    );
  }
}
