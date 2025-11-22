/**
 * Setup Gmail push notifications
 * Call this once to start receiving Gmail notifications
 */

import { NextRequest, NextResponse } from "next/server";
import { setupPushNotifications } from "@/integrations/gmail";
import { auth } from "@/lib/auth/server";
import { env } from "@/env";

// Allow GET for easy browser testing
export async function GET(request: NextRequest) {
  return handleSetup(request);
}

export async function POST(request: NextRequest) {
  return handleSetup(request);
}

async function handleSetup(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Your Pub/Sub topic name (format: projects/{project-id}/topics/{topic-name})
    const topic = env.GMAIL_PUBSUB_TOPIC;

    if (!topic) {
      return NextResponse.json(
        { error: "GMAIL_PUBSUB_TOPIC not configured in environment" },
        { status: 500 }
      );
    }

    console.log("[Setup] Setting up Gmail push notifications...");
    console.log("[Setup] Topic:", topic);

    const result = await setupPushNotifications(session.user.id, topic);

    console.log("[Setup] Success!", result);

    return NextResponse.json({
      success: true,
      message: "Gmail notifications enabled",
      expiration: result.expiration,
      historyId: result.historyId,
    });
  } catch (error) {
    console.error("[Setup] Failed:", error);
    return NextResponse.json(
      {
        error: "Setup failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
