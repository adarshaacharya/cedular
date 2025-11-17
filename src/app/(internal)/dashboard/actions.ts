"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth/get-session";

/**
 * Check if user has Google (Gmail/Calendar) connected
 */
export async function getGoogleConnectionStatus() {
  const session = await getServerSession();

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
