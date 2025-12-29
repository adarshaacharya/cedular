"use client";

import { useState } from "react";
import { useChat, UIMessage } from "@ai-sdk/react";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import type { ToolUIPart } from "ai";
import {
  CopyIcon,
  RefreshCcwIcon,
  Loader2Icon,
  CheckCircleIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateUUID } from "@/lib/utils";

import { ChatHeader } from "@/components/ai-elements/chat-header";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Greeting } from "@/app/(internal)/chat/_components/greeting";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
} from "@/components/ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Suggestion } from "@/components/ai-elements/suggestion";
import { ThinkingMessage } from "@/components/ai-elements/thinking-message";
import { toast } from "sonner";

interface ChatProps {
  id: string;
  initialMessages: UIMessage[];
}

const calendarSuggestions = [
  "Schedule a meeting with the design team next week",
  "Find available slots for a 30-minute call tomorrow",
  "Check my calendar for conflicts on Friday afternoon",
  "Set up a recurring weekly team standup",
];

// Get user-friendly tool name
const getToolDisplayName = (name: string) => {
  const names: Record<string, string> = {
    getUserCalendarEvents: "Checking your calendar",
    getCalendarEvents: "Checking calendar availability",
    getCalendarEvent: "Fetching event details",
    createCalendarEvent: "Creating calendar event",
    updateCalendarEvent: "Updating calendar event",
    deleteCalendarEvent: "Deleting calendar event",
  };
  return names[name] || `Executing ${name}`;
};

export function Chat({ id, initialMessages }: ChatProps) {
  const [input, setInput] = useState("");
  const [hasStartedConversation, setHasStartedConversation] = useState(
    initialMessages.length > 0
  );
  const { messages, sendMessage, status, regenerate } = useChat({
    id,
    messages: initialMessages,
    generateId: generateUUID,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onError: (error) => {
      console.error(error);
      toast.error(error.message);
    },
  });

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text) return;

    sendMessage({ text: message.text });
    setInput("");
    setHasStartedConversation(true);

    // Update URL for new chats (not existing ones)
    if (initialMessages.length === 0) {
      window.history.replaceState({}, "", `/chat/${id}`);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage({ text: suggestion });
    setHasStartedConversation(true);

    // Update URL for new chats (not existing ones)
    if (initialMessages.length === 0) {
      window.history.replaceState({}, "", `/chat/${id}`);
    }
  };

  return (
    <div className="overscroll-behavior-contain flex h-dvh min-w-0 touch-pan-y flex-col bg-background">
      <ChatHeader />

      {hasStartedConversation ? (
        <motion.div
          className="flex-1 min-h-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <Conversation className="h-full">
            <ConversationContent className="mx-auto max-w-4xl pb-15">
              {messages.map((message) => (
                <div key={message.id}>
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <Message
                            key={`${message.id}-${i}`}
                            from={message.role}
                          >
                            <MessageContent>
                              <MessageResponse>{part.text}</MessageResponse>
                            </MessageContent>
                            {message.role === "assistant" &&
                              i === messages.length - 1 && (
                                <MessageActions>
                                  <MessageAction
                                    onClick={() => regenerate()}
                                    label="Retry"
                                  >
                                    <RefreshCcwIcon className="size-3" />
                                  </MessageAction>
                                  <MessageAction
                                    onClick={() =>
                                      navigator.clipboard.writeText(part.text)
                                    }
                                    label="Copy"
                                  >
                                    <CopyIcon className="size-3" />
                                  </MessageAction>
                                </MessageActions>
                              )}
                          </Message>
                        );
                      case "reasoning":
                        return (
                          <Reasoning
                            key={`${message.id}-${i}`}
                            className="w-full"
                            isStreaming={
                              status === "streaming" &&
                              i === message.parts.length - 1 &&
                              message.id === messages.at(-1)?.id
                            }
                          >
                            <ReasoningTrigger />
                            <ReasoningContent>{part.text}</ReasoningContent>
                          </Reasoning>
                        );
                      case "tool-getUserCalendarEvents":
                      case "tool-getCalendarEvents":
                      case "tool-getCalendarEvent":
                      case "tool-createCalendarEvent":
                      case "tool-updateCalendarEvent":
                      case "tool-deleteCalendarEvent":
                        const toolName = part.type.replace("tool-", "");

                        // Extract user-friendly message from tool output if available
                        const getToolStatusMessage = () => {
                          if (
                            part.state === "output-available" &&
                            part.output
                          ) {
                            const output = part.output as Record<
                              string,
                              unknown
                            >;

                            // If tool returned a message field, use it
                            if (typeof output?.message === "string") {
                              return output.message;
                            }
                            // For successful operations, show minimal status
                            if (output?.success === true) {
                              return "Completed";
                            }
                            // Otherwise show minimal status
                            return "Completed";
                          }
                          return null;
                        };

                        const statusMessage = getToolStatusMessage();

                        return (
                          <Message
                            key={`${message.id}-${i}`}
                            from={message.role}
                          >
                            <MessageContent>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {(() => {
                                  switch (part.state as ToolUIPart["state"]) {
                                    case "input-streaming":
                                      return (
                                        <>
                                          <Loader2Icon className="size-3 animate-spin" />
                                          <span>
                                            Preparing{" "}
                                            {getToolDisplayName(
                                              toolName
                                            ).toLowerCase()}
                                            ...
                                          </span>
                                        </>
                                      );
                                    case "input-available":
                                      return (
                                        <>
                                          <Loader2Icon className="size-3 animate-spin" />
                                          <span>
                                            {getToolDisplayName(toolName)}...
                                          </span>
                                        </>
                                      );
                                    case "output-available":
                                      return (
                                        <>
                                          <CheckCircleIcon className="size-3 text-green-600" />
                                          <span>
                                            {statusMessage || "Completed"}
                                          </span>
                                        </>
                                      );
                                    case "output-error":
                                      return (
                                        <>
                                          <span className="text-red-600">
                                            ❌
                                          </span>
                                          <span>
                                            {part.errorText ||
                                              "Tool execution failed"}
                                          </span>
                                        </>
                                      );
                                    default:
                                      return null;
                                  }
                                })()}
                              </div>
                            </MessageContent>
                          </Message>
                        );
                      default:
                        return null;
                    }
                  })}
                </div>
              ))}

              {status === "submitted" && <ThinkingMessage />}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        </motion.div>
      ) : (
        /* Centered initial layout */
        <motion.div
          className="flex-1 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="w-full max-w-4xl mx-auto px-2 md:px-4">
            <div className="flex flex-col gap-6 items-center">
              <Greeting />

              <PromptInput onSubmit={handleSubmit}>
                <PromptInputBody>
                  <PromptInputTextarea
                    onChange={(e) => setInput(e.target.value)}
                    value={input}
                    placeholder="Ask me anything about your calendar..."
                  />
                </PromptInputBody>
                <PromptInputFooter>
                  <PromptInputSubmit disabled={!input} status={status} />
                </PromptInputFooter>
              </PromptInput>

              <div className="w-full">
                <div
                  className="grid w-full gap-2 sm:grid-cols-2"
                  data-testid="suggested-actions"
                >
                  {calendarSuggestions.map((suggestedAction, index) => (
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      initial={{ opacity: 0, y: 20 }}
                      key={suggestedAction}
                      transition={{ delay: 0.05 * index }}
                    >
                      <Suggestion
                        className="h-auto w-full whitespace-normal p-3 text-left"
                        onClick={handleSuggestionClick}
                        suggestion={suggestedAction}
                      >
                        {suggestedAction}
                      </Suggestion>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Bottom input for active conversation */}
      <AnimatePresence>
        {hasStartedConversation && (
          <motion.div
            className="sticky bottom-0 z-1 mx-auto flex w-full max-w-4xl gap-2 border-t-0 bg-background px-2 pb-3 md:px-4 md:pb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <PromptInput onSubmit={handleSubmit}>
              <PromptInputBody>
                <PromptInputTextarea
                  onChange={(e) => setInput(e.target.value)}
                  value={input}
                />
              </PromptInputBody>
              <PromptInputFooter>
                <PromptInputSubmit disabled={!input} status={status} />
              </PromptInputFooter>
            </PromptInput>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
