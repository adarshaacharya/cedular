import { UIMessage } from "ai";
import prisma from "@/lib/prisma";
import { Prisma } from "../../prisma/generated/prisma/client";

/**
 * Creates a new chat for the given user
 * @param userId - The user ID
 * @param chatId - Optional specific chat ID to use
 * @returns The new chat ID
 */
export async function createChat(
  userId: string,
  chatId?: string
): Promise<string | undefined> {
  try {
    const chat = await prisma.chat.create({
      data: {
        ...(chatId && { id: chatId }),
        userId,
      },
    });

    return chat.id;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "code" in error &&
      typeof error.code === "string"
    ) {
      if (error.code === "P2002" && chatId) {
        const existingChat = await prisma.chat.findFirst({
          where: {
            id: chatId,
            userId,
          },
        });

        if (existingChat) {
          return existingChat.id;
        }

        throw new Error("Chat ID already exists and is not owned by this user");
      }

      throw error;
    }
  }
}

/**
 * Loads a chat and its messages
 * @param chatId - The chat ID to load
 * @returns The chat messages in UIMessage format, or null if chat not found
 */
export async function loadChat(chatId: string): Promise<UIMessage[] | null> {
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!chat) {
    return null;
  }

  return chat.messages.map((msg) => msg.content as unknown as UIMessage);
}

/**
 * Saves messages to a chat (replace-all strategy)
 * @param chatId - The chat ID
 * @param messages - The complete message history to save
 */
export async function saveChat(
  chatId: string,
  messages: UIMessage[]
): Promise<void> {
  if (messages.length === 0) return;

  // Replace all messages in a transaction
  await prisma.$transaction([
    prisma.chatMessage.deleteMany({ where: { chatId } }),
    prisma.chatMessage.createMany({
      data: messages.map((msg) => ({
        chatId,
        role: msg.role === "user" ? "user" : "assistant",
        content: msg as unknown as Prisma.InputJsonValue,
      })),
    }),
    prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    }),
  ]);
}

/**
 * Gets all chats for a user
 * @param userId - The user ID
 * @returns List of user's chats
 */
export async function getUserChats(userId: string) {
  return await prisma.chat.findMany({
    where: { userId },
    take: 20,
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      messages: {
        take: 1,
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}
