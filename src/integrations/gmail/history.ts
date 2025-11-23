/**
 * Gmail History API Integration
 *
 * Tracks changes to Gmail mailbox using history IDs
 * This prevents duplicate processing and infinite loops
 */

import { getGmailClient } from "./_lib/auth";
import { GMAIL_USER_ID, GMAIL_LABELS } from "./constants";
import prisma from "@/lib/prisma";

export interface HistoryEvent {
  type: "messageAdded" | "messageDeleted" | "labelAdded" | "labelRemoved";
  messageId: string;
  threadId: string;
}

export interface HistoryResult {
  events: HistoryEvent[];
  latestHistoryId: string;
}

/**
 * Get Gmail history changes since a specific history ID
 * Only returns messagesAdded events for incoming emails (excludes sent messages)
 */
export async function getHistorySinceId(
  userId: string,
  startHistoryId: string
): Promise<HistoryResult> {
  const gmail = await getGmailClient(userId);

  try {
    const response = await gmail.users.history.list({
      userId: GMAIL_USER_ID,
      startHistoryId,
      historyTypes: ["messageAdded"], // Only track new messages, not sent/deleted
      maxResults: 100,
    });

    const history = response.data.history || [];
    const latestHistoryId = response.data.historyId || startHistoryId;

    const events: HistoryEvent[] = [];

    // Get user preferences to check assistant email
    const userPreferences = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    const assistantEmail = userPreferences?.assistantEmail?.toLowerCase();

    // Extract messagesAdded events, filtering out sent messages
    for (const record of history) {
      if (record.messagesAdded) {
        for (const added of record.messagesAdded) {
          if (added.message?.id && added.message?.threadId) {
            // Fetch message details to check sender
            try {
              const messageResponse = await gmail.users.messages.get({
                userId: GMAIL_USER_ID,
                id: added.message.id,
                format: "metadata",
                metadataHeaders: ["From"],
              });

              const headers = messageResponse.data.payload?.headers || [];
              const fromHeader = headers.find(h => h.name?.toLowerCase() === "from");
              const senderEmail = fromHeader?.value?.toLowerCase();

              // Skip if message is from assistant (prevents infinite loop)
              if (assistantEmail && senderEmail?.includes(assistantEmail)) {
                console.log(
                  `[History API] Skipping message from assistant: ${added.message.id} (sender: ${senderEmail})`
                );
                continue;
              }

              // Skip if message has SENT label (definitely outgoing)
              const labelIds = added.message.labelIds || [];
              if (labelIds.includes("SENT")) {
                console.log(
                  `[History API] Skipping sent message: ${added.message.id}`
                );
                continue;
              }

              events.push({
                type: "messageAdded",
                messageId: added.message.id,
                threadId: added.message.threadId,
              });
            } catch (messageError) {
              console.warn(
                `[History API] Could not fetch message details for ${added.message.id}, skipping:`,
                messageError
              );
              // Skip messages we can't verify
              continue;
            }
          }
        }
      }
    }

    console.log(
      `[History API] Found ${events.length} new incoming messages since historyId ${startHistoryId}`
    );

    return {
      events,
      latestHistoryId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // If history ID is too old or invalid, Gmail returns 404
    if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
      console.warn(
        `[History API] History ID ${startHistoryId} is too old or invalid. Need to resync.`
      );
      throw new Error("HISTORY_ID_TOO_OLD");
    }

    throw new Error(`Failed to get history: ${errorMessage}`);
  }
}

/**
 * Get current history ID without fetching changes
 * Useful for initializing tracking
 */
export async function getCurrentHistoryId(userId: string): Promise<string> {
  const gmail = await getGmailClient(userId);

  try {
    const profile = await gmail.users.getProfile({
      userId: GMAIL_USER_ID,
    });

    return profile.data.historyId || "";
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get current history ID: ${errorMessage}`);
  }
}
