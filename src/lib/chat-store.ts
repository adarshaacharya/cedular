import { UIMessage } from "ai";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth/get-session";
import { Prisma } from "../../prisma/generated/prisma/client";

/**
 * Creates a new chat for the authenticated user
 * @param chatId - Optional specific chat ID to use
 * @returns The new chat ID
 */
export async function createChat(chatId?: string): Promise<string> {
  const session = await getServerSession();

  if (!session?.user?.id) {
    throw new Error(
      "Unauthorized: User must be authenticated to create a chat"
    );
  }

  try {
    const chat = await prisma.chat.create({
      data: {
        ...(chatId && { id: chatId }),
        userId: session.user.id,
      },
    });

    return chat.id;
  } catch (error: any) {
    // Handle duplicate key error (chat already exists)
    if (error.code === "P2002" && chatId) {
      // Chat with this ID already exists, verify ownership
      const existingChat = await prisma.chat.findFirst({
        where: {
          id: chatId,
          userId: session.user.id,
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

/**
 * Loads a chat and its messages for the authenticated user
 * @param chatId - The chat ID to load
 * @returns The chat messages in UIMessage format, or null if chat not found/unauthorized
 */
export async function loadChat(chatId: string): Promise<UIMessage[] | null> {
  const session = await getServerSession();

  if (!session?.user?.id) {
    throw new Error("Unauthorized: User must be authenticated to load a chat");
  }

  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      userId: session.user.id, // Ensure user owns this chat
    },
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

  // Convert stored messages to UIMessage format
  return chat.messages.map((msg) => msg.content as unknown as UIMessage);
}

/**
 * Saves messages to a chat (replace-all strategy)
 * @param chatId - The chat ID
 * @param messages - The messages to save
 */
export async function saveChat(
  chatId: string,
  messages: UIMessage[]
): Promise<void> {
  const session = await getServerSession();

  if (!session?.user?.id) {
    throw new Error("Unauthorized: User must be authenticated to save a chat");
  }

  // Verify user owns this chat
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      userId: session.user.id,
    },
  });

  if (!chat) {
    throw new Error("Chat not found or unauthorized");
  }

  // Replace all messages (delete old ones, insert new ones)
  await prisma.$transaction([
    prisma.chatMessage.deleteMany({
      where: { chatId },
    }),
    prisma.chatMessage.createMany({
      data: messages.map((msg) => ({
        chatId,
        role: msg.role === "user" ? "user" : "assistant",
        content: msg as unknown as Prisma.InputJsonValue, // Store entire UIMessage as JSON
      })),
    }),
  ]);

  // Update chat's updatedAt timestamp
  await prisma.chat.update({
    where: { id: chatId },
    data: { updatedAt: new Date() },
  });
}

/**
 * Gets all chats for the authenticated user
 * @returns List of user's chats
 */
export async function getUserChats() {
  const session = await getServerSession();

  if (!session?.user?.id) {
    throw new Error("Unauthorized: User must be authenticated to list chats");
  }

  return await prisma.chat.findMany({
    where: {
      userId: session.user.id,
    },
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
