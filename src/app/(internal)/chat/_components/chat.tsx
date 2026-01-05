"use client";

import { useState } from "react";
import { useChat, UIMessage } from "@ai-sdk/react";
import {
  lastAssistantMessageIsCompleteWithToolCalls,
  DefaultChatTransport,
} from "ai";
import { CopyIcon, RefreshCcwIcon } from "lucide-react";
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
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { toast } from "sonner";
import {
  Confirmation,
  ConfirmationRequest,
  ConfirmationAccepted,
  ConfirmationRejected,
  ConfirmationActions,
  ConfirmationAction,
} from "@/components/ai-elements/confirmation";
import {
  CreateCalendarEventConfirmation,
  UpdateCalendarEventConfirmation,
  DeleteCalendarEventConfirmation,
  UpdateCalendarEventToolInput,
  DeleteCalendarEventToolInput,
  CreateCalendarEventToolInput,
} from "./tools/calendar-tools";

interface ChatProps {
  id: string;
  initialMessages: UIMessage[];
}

const calendarSuggestions = [
  "Schedule a meeting with the design team next week",
  "Find available slots for a 30-minute call tomorrow",
  "Do I have any meetings scheduled for tomorrow?",
  "Set up a recurring weekly team standup",
];

// Get user-friendly tool title
const getToolTitle = (type: string) => {
  const toolName = type.replace("tool-", "");
  const titles: Record<string, string> = {
    getUserCalendarEvents: "Get Your Calendar Events",
    getCalendarEvents: "Check Calendar Availability",
    getCalendarEvent: "Get Event Details",
    createCalendarEvent: "Create Calendar Event",
    updateCalendarEvent: "Update Calendar Event",
    deleteCalendarEvent: "Delete Calendar Event",
  };
  return titles[toolName] || toolName;
};

export function Chat({ id, initialMessages }: ChatProps) {
  const [input, setInput] = useState("");
  const [hasStartedConversation, setHasStartedConversation] = useState(
    initialMessages.length > 0
  );
  const { messages, sendMessage, status, regenerate, addToolApprovalResponse } =
    useChat({
      id,
      messages: initialMessages,
      generateId: generateUUID,
      sendAutomaticallyWhen:
        lastAssistantMessageIsCompleteWithToolCalls,
      onError: (error) => {
        console.error(error);
        toast.error(error.message);
      },
      onToolCall: ({ toolCall }) => {
        // Check if it's a dynamic tool first for proper type narrowing
        if (toolCall.dynamic) {
          return;
        }
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

                      // Read-only calendar tools - display results directly
                      case "tool-getUserCalendarEvents":
                      case "tool-getCalendarEvents":
                      case "tool-getCalendarEvent":
                        return (
                          <Tool
                            key={`${message.id}-${i}`}
                            defaultOpen={false}
                            className="mb-4"
                          >
                            <ToolHeader
                              title={getToolTitle(part.type)}
                              type={part.type}
                              state={part.state}
                            />
                            <ToolContent>
                              <ToolInput input={part.input} />
                              <ToolOutput
                                output={part.output}
                                errorText={part.errorText}
                              />
                            </ToolContent>
                          </Tool>
                        );

                      // Approval-required calendar tools - use confirmation workflow
                      case "tool-createCalendarEvent":
                      case "tool-updateCalendarEvent":
                      case "tool-deleteCalendarEvent":
                        return (
                          <Confirmation
                            key={`${message.id}-${i}`}
                            approval={part.approval}
                            state={part.state}
                            className="mb-4 shadow-md"
                          >
                            <ConfirmationRequest>
                              <div className="space-y-4">
                                <div className="font-medium text-xl">
                                  {getToolTitle(part.type)}
                                </div>
                                {part.type === "tool-createCalendarEvent" && (
                                  <CreateCalendarEventConfirmation
                                    input={
                                      part.input as CreateCalendarEventToolInput
                                    }
                                  />
                                )}
                                {part.type === "tool-updateCalendarEvent" && (
                                  <UpdateCalendarEventConfirmation
                                    input={
                                      part.input as UpdateCalendarEventToolInput
                                    }
                                  />
                                )}
                                {part.type === "tool-deleteCalendarEvent" && (
                                  <DeleteCalendarEventConfirmation
                                    input={
                                      part.input as DeleteCalendarEventToolInput
                                    }
                                  />
                                )}
                              </div>
                            </ConfirmationRequest>

                            <ConfirmationAccepted>
                              <div className="space-y-2">
                                <div className="text-green-600 text-sm">
                                  ✓ {getToolTitle(part.type)} completed
                                  successfully
                                </div>
                                {part.type === "tool-createCalendarEvent" && (
                                  <CreateCalendarEventConfirmation
                                    input={
                                      part.input as CreateCalendarEventToolInput
                                    }
                                  />
                                )}
                                {part.type === "tool-updateCalendarEvent" && (
                                  <UpdateCalendarEventConfirmation
                                    input={
                                      part.input as UpdateCalendarEventToolInput
                                    }
                                  />
                                )}
                                {part.type === "tool-deleteCalendarEvent" && (
                                  <DeleteCalendarEventConfirmation
                                    input={
                                      part.input as DeleteCalendarEventToolInput
                                    }
                                  />
                                )}
                              </div>
                            </ConfirmationAccepted>

                            <ConfirmationRejected>
                              <div className="space-y-2">
                                <div className="text-red-600 text-sm">
                                  ✗ {getToolTitle(part.type)} was cancelled
                                </div>
                                {part.type === "tool-createCalendarEvent" && (
                                  <CreateCalendarEventConfirmation
                                    input={
                                      part.input as CreateCalendarEventToolInput
                                    }
                                  />
                                )}
                                {part.type === "tool-updateCalendarEvent" && (
                                  <UpdateCalendarEventConfirmation
                                    input={
                                      part.input as UpdateCalendarEventToolInput
                                    }
                                  />
                                )}
                                {part.type === "tool-deleteCalendarEvent" && (
                                  <DeleteCalendarEventConfirmation
                                    input={
                                      part.input as DeleteCalendarEventToolInput
                                    }
                                  />
                                )}
                              </div>
                            </ConfirmationRejected>

                            <ConfirmationActions>
                              <ConfirmationAction
                                variant="outline"
                                onClick={() => {
                                  if (part.approval?.id) {
                                    addToolApprovalResponse({
                                      id: part.approval.id,
                                      approved: false,
                                    });
                                  }
                                }}
                              >
                                Deny
                              </ConfirmationAction>
                              <ConfirmationAction
                                variant="default"
                                onClick={() => {
                                  if (part.approval?.id) {
                                    addToolApprovalResponse({
                                      id: part.approval.id,
                                      approved: true,
                                    });
                                  }
                                }}
                              >
                                Approve
                              </ConfirmationAction>
                            </ConfirmationActions>
                          </Confirmation>
                        );
                      default:
                        return null;
                    }
                  })}
                </div>
              ))}

              {status === "submitted" &&
                !messages.some((msg) =>
                  msg.parts?.some((part) => "approval" in part && part.approval)
                ) && <ThinkingMessage />}
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
