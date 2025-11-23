/**
 * Orchestrates the entire flow when Gmail sends a notification
 * Uses Gmail History API to prevent infinite loops
 *
 * Steps:
 * 1. Get history changes since last processed historyId
 * 2. Process only messagesAdded events (skip sent emails)
 * 3. Parse email (Email Parser Agent)
 * 4. Find calendar slots (Calendar Agent)
 * 5. Generate response (Response Generator Agent)
 * 6. Send email (Gmail Integration)
 * 7. Update lastProcessedHistoryId
 */

import {
  fetchEmailThread,
  fetchLatestUnreadThread,
  sendEmail,
  markThreadAsRead,
  getHistorySinceId,
  getCurrentHistoryId,
} from "@/integrations/gmail";
import { extractEmailName } from "@/integrations/gmail/utils";
import { parseEmail } from "@/agents/email-parser";
import { generateResponse } from "@/agents/response-generator";
import prisma from "@/lib/prisma";
import { runCalendarAgent } from "@/agents/calendar-agent";
import { createEmailThread } from "@/services/email-thread-service";

export interface EmailProcessorInput {
  threadId: string;
  userId: string;
  messageId: string;
}

export interface EmailProcessorResult {
  success: boolean;
  threadId: string;
  responseMessageId?: string;
  error?: string;
  duration: number;
}

export async function processEmail(
  input: EmailProcessorInput
): Promise<EmailProcessorResult> {
  const startTime = Date.now();
  const { threadId, userId, messageId } = input;

  try {
    // Fetch user preferences first
    const userPreferences = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    // Step 1: Fetch email from Gmail
    let emailThread;

    if (threadId) {
      console.log(`[Workflow] Fetching email thread: ${threadId}`);
      emailThread = await fetchEmailThread(threadId, userId);
    } else {
      console.log(`[Workflow] Fetching latest unread email`);
      emailThread = await fetchLatestUnreadThread(userId);

      if (!emailThread) {
        console.log(`[Workflow] No unread emails found`);
        return {
          success: false,
          threadId: "",
          error: "No unread emails found",
          duration: Date.now() - startTime,
        };
      }
    }

    if (!emailThread) {
      throw new Error("Failed to fetch email thread");
    }

    const senderEmail = emailThread.from;
    const emailBody = emailThread.body;
    const emailSubject = emailThread.subject;
    const senderName = extractEmailName(senderEmail);

    const assistantName = userPreferences?.assistantEmail
      ? extractEmailName(userPreferences.assistantEmail)
      : "Assistant";

    console.log(`[Workflow] Email from: ${senderEmail} (name: ${senderName})`);
    console.log(`[Workflow] Original subject: "${emailSubject}"`);
    console.log(
      `[Workflow] Assistant email: ${userPreferences?.assistantEmail} (name: ${assistantName})`
    );

    // Skip if email is from the assistant itself (prevent infinite loop)
    if (userPreferences?.assistantEmail) {
      const assistantEmail = userPreferences.assistantEmail.toLowerCase();
      const fromEmail = senderEmail.toLowerCase();

      // Check if the sender email contains the assistant's email
      if (fromEmail.includes(assistantEmail)) {
        console.log(
          `[Workflow] ✅ Skipping email from assistant itself (loop prevention)`
        );
        return {
          success: true,
          threadId,
          duration: Date.now() - startTime,
        };
      }
    }

    // Step 2: Parse email with Email Parser Agent
    console.log(`[Workflow] Parsing email intent`);
    const parsedIntent = await parseEmail({
      subject: emailSubject,
      emailBody: emailBody,
      userId: senderEmail,
    });

    // Skip if not a scheduling request
    if (parsedIntent.intent === "info_request") {
      console.log(`[Workflow] Skipping info_request email`);
      return {
        success: true,
        threadId,
        duration: Date.now() - startTime,
      };
    }

    // Step 3: Find optimal calendar slots
    console.log(`[Workflow] Finding optimal calendar slots`);
    const { slots: availableSlots } = await runCalendarAgent(
      {
        participants: parsedIntent.participants,
        duration: parsedIntent.duration || 60,
        preferences: {
          timezone: userPreferences?.timezone || "UTC",
          workingHoursStart: "09:00",
          workingHoursEnd: "17:00",
          bufferMinutes: 15,
        },
      },
      userId
    );

    if (!availableSlots || availableSlots.length === 0) {
      console.warn(`[Workflow] No available slots found`);
    }

    // Format slots for response generator
    const slotsFormatted = availableSlots.reduce((acc, slot) => {
      acc[`${slot.start} - ${slot.end}`] = slot.score.toString();
      return acc;
    }, {} as Record<string, string>);

    // Step 4: Generate email response
    console.log(`[Workflow] Generating email response`);
    const generatedResponse = await generateResponse({
      emailContext: emailBody,
      parsedIntent: parsedIntent.intent,
      availableSlots: slotsFormatted,
      userId,
      senderName,
      assistantName,
    });

    if (!generatedResponse) {
      throw new Error("Failed to generate email response");
    }

    // Step 5: Send email via Gmail
    console.log(`[Workflow] Sending email response`);
    console.log(`[Workflow] Reply subject: "Re: ${emailSubject}"`);
    console.log(
      `[Workflow] Response preview: ${generatedResponse.substring(0, 100)}...`
    );

    // Get the latest message ID for proper reply threading
    const latestMessageId =
      emailThread.messages[emailThread.messages.length - 1]?.id;

    const sendResult = await sendEmail({
      to: senderEmail,
      body: generatedResponse,
      threadId: emailThread.threadId,
      userId,
      subject:
        emailSubject && emailSubject.trim()
          ? `Re: ${emailSubject.replace(/^Re:\s*/i, "")}` // Remove existing "Re:" prefix if present
          : "Re: Meeting Request",
      messageId: latestMessageId, // For proper reply headers
    });

    // Step 6: Mark the original email as read (prevent reprocessing)
    if (emailThread.threadId) {
      console.log(`[Workflow] Marking email as read`);
      await markThreadAsRead(emailThread.threadId, userId);
    }

    // Step 7: Save email thread to database
    await createEmailThread({
      userId,
      threadId: emailThread.threadId || "",
      subject: emailSubject,
      participants: [senderEmail],
      intent: parsedIntent.intent,
      status: "completed",
    });

    await prisma.agentLog.create({
      data: {
        userId,
        agentName: "workflow_orchestrator",
        model: "workflow",
        latencyMs: Date.now() - startTime,
        tokensUsed: 0,
        input: {
          threadId: emailThread.threadId,
          messageId,
          intent: parsedIntent.intent,
        },
        output: {
          success: true,
          slotsCount: availableSlots.length,
          responseMessageId: sendResult.messageId,
        },
      },
    });
    console.log(
      `[Workflow] Completed successfully for thread: ${emailThread.threadId}`
    );

    return {
      success: true,
      threadId,
      responseMessageId: sendResult.messageId ?? undefined,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`[Workflow] Error processing email: ${errorMessage}`);

    // Log failed workflow execution
    await prisma.agentLog.create({
      data: {
        userId,
        agentName: "workflow_orchestrator",
        model: "workflow",
        latencyMs: Date.now() - startTime,
        tokensUsed: 0,
        input: {
          threadId,
          messageId,
        },
        output: {
          success: false,
          error: errorMessage,
        },
      },
    });

    return {
      success: false,
      threadId,
      error: errorMessage,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Process emails using Gmail History API
 * This prevents infinite loops by only processing messagesAdded events
 */
export interface HistoryProcessorInput {
  userId: string;
  historyId: string;
  notificationMessageId: string;
}

export interface HistoryProcessorResult {
  success: boolean;
  processedCount: number;
  error?: string;
  duration: number;
}

export async function processEmailFromHistory(
  input: HistoryProcessorInput
): Promise<HistoryProcessorResult> {
  const startTime = Date.now();
  const { userId, historyId, notificationMessageId } = input;

  try {
    console.log(`[History Workflow] Starting for user: ${userId}`);

    // Get user preferences with last processed history ID
    const userPreferences = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (!userPreferences) {
      throw new Error("User preferences not found");
    }

    // If no lastProcessedHistoryId, initialize it with current history
    if (!userPreferences.lastProcessedHistoryId) {
      console.log(
        "[History Workflow] No lastProcessedHistoryId found, initializing..."
      );
      const currentHistoryId = await getCurrentHistoryId(userId);

      await prisma.userPreferences.update({
        where: { userId },
        data: { lastProcessedHistoryId: currentHistoryId },
      });

      console.log(
        `[History Workflow] Initialized lastProcessedHistoryId: ${currentHistoryId}`
      );
      return {
        success: true,
        processedCount: 0,
        duration: Date.now() - startTime,
      };
    }

    // Get history changes since last processed
    let historyResult;
    try {
      historyResult = await getHistorySinceId(
        userId,
        userPreferences.lastProcessedHistoryId
      );
    } catch (error) {
      // If history ID is too old, reinitialize
      if (error instanceof Error && error.message === "HISTORY_ID_TOO_OLD") {
        console.log(
          "[History Workflow] History ID too old, reinitializing with current history..."
        );
        const currentHistoryId = await getCurrentHistoryId(userId);

        await prisma.userPreferences.update({
          where: { userId },
          data: { lastProcessedHistoryId: currentHistoryId },
        });

        return {
          success: true,
          processedCount: 0,
          duration: Date.now() - startTime,
        };
      }
      throw error;
    }

    console.log(
      `[History Workflow] Found ${historyResult.events.length} new messages`
    );

    // Process each new message
    let processedCount = 0;
    for (const event of historyResult.events) {
      if (event.type === "messageAdded") {
        console.log(
          `[History Workflow] Processing threadId: ${event.threadId}`
        );

        // Process the email using existing workflow logic
        await processEmail({
          threadId: event.threadId,
          userId,
          messageId: event.messageId,
        });

        processedCount++;
      }
    }

    // Update lastProcessedHistoryId
    await prisma.userPreferences.update({
      where: { userId },
      data: { lastProcessedHistoryId: historyResult.latestHistoryId },
    });

    console.log(
      `[History Workflow] Updated lastProcessedHistoryId to: ${historyResult.latestHistoryId}`
    );

    return {
      success: true,
      processedCount,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`[History Workflow] Error: ${errorMessage}`);

    return {
      success: false,
      processedCount: 0,
      error: errorMessage,
      duration: Date.now() - startTime,
    };
  }
}
