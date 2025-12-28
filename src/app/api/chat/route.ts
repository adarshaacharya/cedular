import {
  convertToModelMessages,
  streamText,
  UIMessage,
  createIdGenerator,
  validateUIMessages,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { createChat, loadChat, saveChat } from "@/lib/chat-store";
import { getServerSession } from "@/lib/auth/get-session";
import prisma from "@/lib/prisma";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  // Check authentication
  const session = await getServerSession();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();

  const {
    id: chatId,
    message,
    messages,
  }: {
    id: string;
    message?: UIMessage;
    messages?: UIMessage[];
  } = body;

  // Check if this is a tool approval flow (all messages sent)
  const isToolApprovalFlow = Boolean(messages);

  // Load chat and messages from database
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      userId: session.user.id,
    },
  });

  let messagesFromDb: UIMessage[] = [];

  if (chat) {
    // Chat exists, load messages unless this is tool approval
    if (!isToolApprovalFlow) {
      messagesFromDb = (await loadChat(chatId)) || [];
    }
  } else if (message?.role === "user") {
    await createChat(chatId);
  }

  // Use all messages for tool approval, otherwise DB messages + new message
  const uiMessages = isToolApprovalFlow
    ? (messages as UIMessage[])
    : [...messagesFromDb, ...(message ? [message] : [])];

  // Validate messages for security
  try {
    validateUIMessages({ messages: uiMessages });
  } catch {
    return new Response("Invalid messages", { status: 400 });
  }

  // Save user message immediately if not tool approval
  if (message?.role === "user") {
    await prisma.chatMessage.create({
      data: {
        chatId,
        role: "user",
        content: message as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      },
    });
  }

  // Generate server-side IDs for consistency
  const generateId = createIdGenerator();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages: await convertToModelMessages(uiMessages),
    system:
      "You are a helpful assistant that can answer questions and help with tasks",
  });

  // Consume the stream to ensure it runs to completion & triggers onFinish
  // even when the client response is aborted:
  result.consumeStream(); // no await

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    originalMessages: isToolApprovalFlow ? uiMessages : undefined,
    generateMessageId: generateId,
    onFinish: async ({ messages: finalMessages }) => {
      // Save finished messages to database
      try {
        if (isToolApprovalFlow) {
          // For tool approval, update existing messages and save new ones
          for (const finishedMsg of finalMessages) {
            const existingMsg = uiMessages.find((m) => m.id === finishedMsg.id);
            if (existingMsg) {
              await prisma.chatMessage.updateMany({
                where: { chatId, id: finishedMsg.id },
                data: {
                  content: finishedMsg as any, // eslint-disable-line @typescript-eslint/no-explicit-any
                },
              });
            } else {
              // Save new message
              await prisma.chatMessage.create({
                data: {
                  chatId,
                  role: finishedMsg.role === "user" ? "user" : "assistant",
                  content: finishedMsg as any, // eslint-disable-line @typescript-eslint/no-explicit-any
                },
              });
            }
          }
        } else {
          // Normal flow - save all messages
          await saveChat(chatId, [
            ...messagesFromDb,
            ...(message ? [message] : []),
            ...finalMessages,
          ]);
        }

        // Update chat timestamp
        await prisma.chat.update({
          where: { id: chatId },
          data: { updatedAt: new Date() },
        });
      } catch (error) {
        console.error("Failed to save chat:", error);
        // Don't throw - we don't want to fail the response if save fails
      }
    },
    onError: (error) => {
      if (error == null) {
        return "unknown error";
      }

      if (typeof error === "string") {
        return error;
      }

      if (error instanceof Error) {
        return error.message;
      }

      return JSON.stringify(error);
    },
  });
}
