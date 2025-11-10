"use server";

import { cache } from "react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Cache the session lookup for request deduplication
const getCachedSession = cache(async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
});

/**
 * Check if user has Google (Gmail/Calendar) connected
 */
export async function getGoogleConnectionStatus() {
  const session = await getCachedSession();

  if (!session?.user) {
    return {
      connected: false,
      email: null,
    };
  }

  const preferences = await prisma.userPreferences.findUnique({
    where: {
      userId: session.user.id,
    },
    select: {
      gmailAccessToken: true,
      gmailRefreshToken: true,
    },
  });

  return {
    connected: Boolean(
      preferences?.gmailAccessToken && preferences?.gmailRefreshToken
    ),
    email: session.user.email,
  };
}
