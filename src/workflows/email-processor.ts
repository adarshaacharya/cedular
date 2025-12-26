/**
 * Orchestrates the entire flow when Gmail sends a notification
 * Uses Gmail History API to prevent infinite loops
 *
 * Steps:
 * 1. Fetch email from Gmail
 * 2. Parse email intent
 * 3. Route to appropriate handler (schedule/confirm/reschedule/cancel)
 * 4. Handler does the work (find slots, create event, send email, etc.)
 */

import {
  fetchEmailThread,
  fetchLatestUnreadThread,
  getHistorySinceId,
  getCurrentHistoryId,
} from "@/integrations/gmail";
import { extractEmailName } from "@/integrations/gmail/utils";
import { parseEmail } from "@/agents/email-parser";
import prisma from "@/lib/prisma";
import { EmailThreadIntent } from "@/prisma/generated/prisma/enums";
import {
  handleConfirm,
  handleSchedule,
  handleReschedule,
  handleCancel,
  HandlerInput,
  HandlerOutput,
} from "./handlers";
import { handleInfoRequest } from "./handlers/info-request.handler";

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

    // Check if this thread already exists in DB (for context)
    const existingDbThread = await prisma.emailThread.findFirst({
      where: { threadId: emailThread.threadId || threadId },
    });

    // Step 2: Parse email with Email Parser Agent
    console.log(`[Workflow] Parsing email intent`);
    const parsedIntent = await parseEmail({
      subject: emailSubject,
      emailBody: emailBody,
      userId: senderEmail,
      participants: emailThread.participants,
      threadHistory: emailThread.messages,
      existingThreadStatus: existingDbThread?.status,
    });

    console.log(
      `[Workflow] Detected intent: ${parsedIntent.intent}${
        existingDbThread
          ? ` (existing thread status: ${existingDbThread.status})`
          : " (new thread)"
      }`
    );

    // Ensure userPreferences exists for handlers
    if (!userPreferences) {
      return {
        success: false,
        threadId,
        error: "User preferences not found",
        duration: Date.now() - startTime,
      };
    }

    const handlerInput = {
      emailThread: {
        threadId: emailThread.threadId || threadId,
        subject: emailSubject,
        body: emailBody,
        from: senderEmail,
        participants: emailThread.participants || [senderEmail],
        messages: emailThread.messages.map((m) => ({ id: m.id || "" })),
      },
      parsedIntent,
      userId,
      userPreferences,
      senderName,
      assistantName,
    };

    // if (parsedIntent.intent === EmailThreadIntent.confirm) {
    //   const result = await handleConfirm(handlerInput);
    //   return { ...result, duration: Date.now() - startTime };
    // }

    // if (parsedIntent.intent === EmailThreadIntent.schedule) {
    //   const result = await handleSchedule(handlerInput);
    //   return { ...result, duration: Date.now() - startTime };
    // }

    // if (parsedIntent.intent === EmailThreadIntent.reschedule) {
    //   const result = await handleReschedule(handlerInput);
    //   return { ...result, duration: Date.now() - startTime };
    // }

    // if (parsedIntent.intent === EmailThreadIntent.cancel) {
    //   const result = await handleCancel(handlerInput);
    //   return { ...result, duration: Date.now() - startTime };
    // }

    const handlerMapper: Record<
      EmailThreadIntent,
      (input: HandlerInput) => Promise<HandlerOutput>
    > = {
      [EmailThreadIntent.confirm]: handleConfirm,
      [EmailThreadIntent.schedule]: handleSchedule,
      [EmailThreadIntent.reschedule]: handleReschedule,
      [EmailThreadIntent.cancel]: handleCancel,
      [EmailThreadIntent.info_request]: handleInfoRequest,
    };

    const handlerFunction = handlerMapper[parsedIntent.intent];

    if (handlerFunction) {
      const result = await handlerFunction(handlerInput);
      return { ...result, duration: Date.now() - startTime };
    }

    // Unknown intent - log and skip
    console.log(`[Workflow] Unknown intent: ${parsedIntent.intent}, skipping`);
    return {
      success: true,
      threadId,
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
  const { userId } = input;

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
