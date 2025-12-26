import { EmailParseResult } from "@/agents/email-parser";
import { UserPreferences } from "@/prisma/generated/prisma/client";

export interface HandlerInput {
  emailThread: {
    threadId: string;
    subject: string;
    body: string;
    from: string;
    to?: string;
    cc?: string;
    participants?: string[];
    messages: Array<{ id: string }>;
  };
  parsedIntent: EmailParseResult;
  userId: string;
  userPreferences: UserPreferences;
  senderName: string;
  assistantName: string;
}

export interface HandlerOutput {
  success: boolean;
  threadId: string;
  responseMessageId?: string;
  error?: string;
}
