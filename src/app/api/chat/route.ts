import {
  convertToModelMessages,
  streamText,
  UIMessage,
  createIdGenerator,
  validateUIMessages,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { createChat, saveChat } from "@/lib/services/chat-store";
import { getServerSession } from "@/lib/auth/get-session";
import prisma from "@/lib/prisma";

export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id: chatId, messages }: { id: string; messages: UIMessage[] } =
    await req.json();

  // Validate we have messages to process
  if (!messages?.length) {
    return new Response("Messages are required", { status: 400 });
  }

  try {
    validateUIMessages({ messages });
  } catch {
    return new Response("Invalid messages", { status: 400 });
  }

  // Check if chat exists and belongs to user
  const chat = await prisma.chat.findFirst({
    where: { id: chatId, userId: session.user.id },
  });

  // Create chat if it doesn't exist and wait for it
  if (!chat) {
    await createChat(session.user.id, chatId);
  }

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages: await convertToModelMessages(messages),
    system: `You are a helpful calendar assistant that can:
- Check my calendar availability
- Schedule meetings and events  
- Find optimal meeting times
- Manage calendar events
- Answer calendar-related questions

Use the available tools to help with calendar tasks.
If user asks unrelated question, politely decline and suggest using the available tools.`,
  });

  result.consumeStream();

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    originalMessages: messages,
    generateMessageId: createIdGenerator(),
    onFinish: async ({ messages: finalMessages }) => {
      try {
        // Save all messages (incoming + AI response)
        await saveChat(chatId, [...messages, ...finalMessages]);
      } catch (error) {
        console.error("Failed to save chat:", error);
      }
    },
    onError: (error) => {
      if (error == null) return "unknown error";
      if (typeof error === "string") return error;
      if (error instanceof Error) return error.message;
      return JSON.stringify(error);
    },
  });
}
