/**
 * Gmail Push Notification Auto-Renewal
 *
 * Gmail watch notifications expire after 7 days.
 * This module provides utilities to automatically renew them.
 */

import {
  setupPushNotifications,
  getCurrentHistoryId,
} from "@/integrations/gmail";
import prisma from "@/lib/prisma";
import { env } from "@/env";
import logger from "@/lib/logger";

const RENEWAL_THRESHOLD_DAYS = 2; // Renew 2 days before expiry (5 days into 7-day period)
const RENEWAL_THRESHOLD_MS = RENEWAL_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

interface WatchRenewalResult {
  userId: string;
  success: boolean;
  newExpiration?: string;
  error?: string;
}

/**
 * Check if a watch needs renewal based on expiration time
 */
export function needsRenewal(expirationTimestamp: string | null): boolean {
  if (!expirationTimestamp) return true;

  const expiryTime = parseInt(expirationTimestamp);
  if (isNaN(expiryTime)) return true;

  const now = Date.now();
  const timeUntilExpiry = expiryTime - now;

  return timeUntilExpiry < RENEWAL_THRESHOLD_MS;
}

/**
 * Renew Gmail watch for a specific user
 */
export async function renewGmailWatch(
  userId: string
): Promise<WatchRenewalResult> {
  try {
    const topic = env.GMAIL_PUBSUB_TOPIC;

    if (!topic) {
      logger.error({ userId }, "GMAIL_PUBSUB_TOPIC not configured");
      return {
        userId,
        success: false,
        error: "GMAIL_PUBSUB_TOPIC not configured",
      };
    }

    logger.info({ userId }, "Renewing Gmail watch subscription");

    const result = await setupPushNotifications(userId, topic);

    // Update the user's history tracking
    const currentHistoryId = await getCurrentHistoryId(userId);

    await prisma.userPreferences.update({
      where: { userId },
      data: {
        gmailWatchExpiration: result.expiration,
        lastProcessedHistoryId: currentHistoryId,
      },
    });

    logger.info(
      { userId, expiration: result.expiration },
      "Gmail watch renewed successfully"
    );

    return {
      userId,
      success: true,
      newExpiration: result.expiration,
    };
  } catch (error) {
    logger.error({ error, userId }, "Failed to renew Gmail watch subscription");

    return {
      userId,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Check and renew watches for all users whose subscriptions are expiring soon
 */
export async function renewExpiringWatches(): Promise<WatchRenewalResult[]> {
  const users = await prisma.userPreferences.findMany({
    where: {
      gmailAccessToken: { not: null },
      gmailRefreshToken: { not: null },
    },
    select: {
      userId: true,
      gmailWatchExpiration: true,
    },
  });

  const results: WatchRenewalResult[] = [];

  for (const user of users) {
    if (needsRenewal(user.gmailWatchExpiration)) {
      logger.info({ userId: user.userId }, "Watch expiring soon, renewing...");
      const result = await renewGmailWatch(user.userId);
      results.push(result);
    }
  }

  return results;
}
