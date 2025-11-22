/**
 * Orchestrates the entire flow when Gmail sends a notification
 * Steps:
 * 1. Fetch email from Gmail
 * 2. Parse email (Email Parser Agent)
 * 3. Find calendar slots (Calendar Agent)
 * 4. Generate response (Response Generator Agent)
 * 5. Send email (Gmail Integration)
 */

import {
  fetchEmailThread,
  fetchLatestUnreadThread,
  sendEmail,
} from "@/integrations/gmail";
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

    // Skip if email is from the assistant itself (prevent infinite loop)
    if (
      userPreferences?.assistantEmail &&
      senderEmail
        .toLowerCase()
        .includes(userPreferences.assistantEmail.toLowerCase())
    ) {
      console.log(`[Workflow] Skipping email from assistant itself`);
      return {
        success: true,
        threadId,
        duration: Date.now() - startTime,
      };
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
    });

    if (!generatedResponse) {
      throw new Error("Failed to generate email response");
    }

    // Step 5: Send email via Gmail
    console.log(`[Workflow] Sending email response`);
    const sendResult = await sendEmail(
      senderEmail,
      generatedResponse,
      emailThread.threadId || "",
      userId,
      `Re: ${emailSubject}`
    );

    // Step 6: Save email thread to database
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
