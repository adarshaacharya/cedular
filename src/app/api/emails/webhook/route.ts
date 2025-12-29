/**
 * Gmail Webhook Handler
 *
 * Receives push notifications from Gmail when new emails arrive
 * Uses Gmail History API to track only new messages
 * Prevents infinite loops and duplicate processing
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface GmailPushNotification {
  message: {
    data: string; // Base64 encoded JSON
    messageId: string;
    publishTime: string;
  };
  subscription: string;
}

interface DecodedGmailData {
  emailAddress: string;
  historyId: number;
}

export async function POST(request: NextRequest) {
  try {
    console.log("[Webhook] Received Gmail push notification");

    // Parse the Gmail push notification
    const body: GmailPushNotification = await request.json();

    if (!body.message?.data) {
      console.error("[Webhook] Missing message data");
      return NextResponse.json(
        { error: "Invalid notification format" },
        { status: 400 }
      );
    }

    // Decode the base64 message data
    const decodedData = Buffer.from(body.message.data, "base64").toString(
      "utf-8"
    );
    const gmailData: DecodedGmailData = JSON.parse(decodedData);

    console.log("[Webhook] Decoded data:", gmailData);

    if (!gmailData.emailAddress) {
      console.error("[Webhook] Missing email address");
      return NextResponse.json(
        { error: "Missing email address" },
        { status: 400 }
      );
    }

    // Find user by their assistant email (the email receiving notifications)
    const userPreferences = await prisma.userPreferences.findFirst({
      where: {
        assistantEmail: gmailData.emailAddress,
      },
      include: {
        user: true,
      },
    });

    if (!userPreferences) {
      console.warn(
        `[Webhook] No user found for email: ${gmailData.emailAddress}`
      );
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userPreferences.userId;
    const currentHistoryId = gmailData.historyId.toString();

    console.log(
      `[Webhook] Processing history for user: ${userId}, historyId: ${currentHistoryId}`
    );

    // Reliable approach: Use History API to process all new emails
    // This ensures we don't miss emails and prevents duplicates
    const { processEmailFromHistory } = await import(
      "@/workflows/email-processor"
    );

    processEmailFromHistory({
      userId,
      historyId: currentHistoryId,
      notificationMessageId: body.message.messageId,
    })
      .then((result) => {
        console.log("[Webhook] History processing completed:", result);
      })
      .catch((error) => {
        console.error("[Webhook] History processing failed:", error);
      });

    // Return 200 immediately so Gmail doesn't retry
    return NextResponse.json(
      {
        success: true,
        message: "Notification received and processing started",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Webhook] Error processing notification:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Handle GET requests (for webhook verification if needed)
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      status: "Gmail webhook endpoint active",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
