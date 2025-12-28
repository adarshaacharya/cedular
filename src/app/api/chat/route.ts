import {
  convertToModelMessages,
  streamText,
  UIMessage,
  createIdGenerator,
  validateUIMessages,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { createChat, loadChat, saveChat } from "@/lib/services/chat-store";
import { getServerSession } from "@/lib/auth/get-session";
import prisma from "@/lib/prisma";

export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id: chatId, message }: { id: string; message?: UIMessage } =
    await req.json();

  // Check if chat exists and belongs to user
  const chat = await prisma.chat.findFirst({
    where: { id: chatId, userId: session.user.id },
  });

  // Create chat if it doesn't exist
  if (!chat && message?.role === "user") {
    await createChat(session.user.id, chatId);
  }

  // Load existing messages
  const messagesFromDb = chat ? (await loadChat(chatId)) || [] : [];
  const uiMessages = [...messagesFromDb, ...(message ? [message] : [])];

  try {
    validateUIMessages({ messages: uiMessages });
  } catch {
    return new Response("Invalid messages", { status: 400 });
  }

  // Save user message
  if (message?.role === "user") {
    await saveChat(chatId, [message]);
  }

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages: await convertToModelMessages(uiMessages),
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
    originalMessages: uiMessages,
    generateMessageId: createIdGenerator(),
    onFinish: async ({ messages: finalMessages }) => {
      try {
        await saveChat(chatId, finalMessages);
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
