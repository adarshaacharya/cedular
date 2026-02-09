"use client";
import Link from "next/link";
import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  ExternalLink,
  Target,
} from "lucide-react";
import { Streamdown } from "streamdown";
import type { EmailThreadModel } from "@/prisma/generated/prisma/models/EmailThread";
import type { MeetingModel } from "@/prisma/generated/prisma/models/Meeting";
import type { EmailMessageModel } from "@/prisma/generated/prisma/models/EmailMessage";

type EmailThreadWithMeetings = EmailThreadModel & {
  meetings: MeetingModel[];
  messages: EmailMessageModel[];
};

interface EmailThreadDetailProps {
  thread: EmailThreadWithMeetings;
}

function getStatusVariant(status: string) {
  switch (status) {
    case "pending":
      return "secondary";
    case "processing":
      return "default";
    case "scheduled":
      return "default";
    case "awaiting_confirmation":
      return "outline";
    case "confirmed":
      return "default";
    case "failed":
      return "destructive";
    default:
      return "secondary";
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "confirmed":
      return "text-green-600";
    case "failed":
      return "text-red-600";
    case "processing":
      return "text-blue-600";
    case "awaiting_confirmation":
      return "text-yellow-600";
    default:
      return "";
  }
}

function getMeetingStatusVariant(status: string) {
  switch (status) {
    case "proposed":
      return "secondary";
    case "confirmed":
      return "default";
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
}

interface ProposedSlot {
  start: string;
  end: string;
  score?: number;
  reason?: string;
}

interface EmailMessageProps {
  message: EmailMessageModel;
  index: number;
  isLast: boolean;
  threadSubject?: string;
}

function EmailMessage({
  message,
  index,
  isLast,
  threadSubject,
}: EmailMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract meeting links from email body
  const extractMeetingLinks = (body: string) => {
    const meetingLinkRegex =
      /(https?:\/\/[^\s]+(?:meet\.google\.com|zoom\.us|teams\.microsoft\.com|meet\.zoom\.us)[^\s]*)/gi;
    return body.match(meetingLinkRegex) || [];
  };

  // Extract time slot proposals from email body
  const extractTimeSlots = (body: string) => {
    // Simple regex to find time patterns - this could be enhanced
    const timeRegex =
      /(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)|\d{1,2}\s*(?:AM|PM|am|pm))/gi;
    return body.match(timeRegex) || [];
  };

  const meetingLinks = extractMeetingLinks(message.body);
  const timeSlots = extractTimeSlots(message.body);

  const bodyText =
    // Prefer extracted text for stable rendering.
    (message as any).bodyText ||
    // Fallback to the legacy body field.
    message.body ||
    "";

  const displayedText =
    bodyText.length > 600 && !isExpanded ? `${bodyText.substring(0, 600)}...` : bodyText;

  return (
    <div className="relative">
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-6 top-12 bottom-0 w-px bg-border" />
      )}

      <div className="flex gap-4 pb-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-background">
            <span className="text-sm font-medium text-primary">
              {message.from.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Email content */}
        <div className="flex-1 min-w-0">
          {/* Email header */}
          <div className="flex items-start justify-between mb-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-medium text-foreground truncate">
                  {message.from}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(message.sentAt), "MMM d 'at' h:mm a")}
                </span>
              </div>

              {/* Recipients */}
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                {message.to.length > 0 && (
                  <span>
                    <span className="font-medium">To:</span>{" "}
                    {message.to.join(", ")}
                  </span>
                )}
                {message.cc && message.cc.length > 0 && (
                  <span>
                    <span className="font-medium">CC:</span>{" "}
                    {message.cc.join(", ")}
                  </span>
                )}
              </div>
            </div>

            <Badge variant="outline" className="text-xs shrink-0 ml-2">
              #{index + 1}
            </Badge>
          </div>

          {/* Email body */}
          <div className="bg-muted/30 rounded-lg p-4 border">
            {message.subject && message.subject !== threadSubject && (
              <div className="mb-3 pb-2 border-b border-border/50">
                <span className="text-sm font-medium text-muted-foreground">
                  Subject: {message.subject}
                </span>
              </div>
            )}

            {/* Meeting links - prominently displayed */}
            {meetingLinks.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Meeting Links
                  </span>
                </div>
                <div className="space-y-1">
                  {meetingLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 hover:underline"
                    >
                      {link}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Time slots - prominently displayed */}
            {timeSlots.length > 0 && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-md border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900 dark:text-green-100">
                    Time Slots Mentioned
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {timeSlots.map((slot, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {slot}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Email content */}
            <div className="text-sm text-foreground">
              <Streamdown className="prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                {displayedText}
              </Streamdown>
            </div>

            {/* Show more/less button */}
            {bodyText.length > 600 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-xs text-primary hover:underline"
              >
                {isExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmailThreadDetail({ thread }: EmailThreadDetailProps) {
  const proposedSlots = thread.proposedSlots as ProposedSlot[] | null;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <Link href="/email-threads">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Email Threads
            </Button>
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {thread.subject || "No Subject"}
              </h1>
              <p className="text-muted-foreground mt-1">
                Gmail Thread ID: {thread.threadId}
              </p>
            </div>
            <Badge
              variant={getStatusVariant(thread.status)}
              className={`text-sm ${getStatusColor(thread.status)}`}
            >
              {thread.status.replace("_", " ")}
            </Badge>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex gap-8">
          {/* Email Thread - Left Side */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <h2 className="text-xl font-semibold">
                Email Conversation ({thread.messages.length} messages)
              </h2>
            </div>

            {thread.messages.length > 0 ? (
              <div className="space-y-0">
                {thread.messages
                  .sort(
                    (a, b) =>
                      new Date(a.sentAt).getTime() -
                      new Date(b.sentAt).getTime()
                  )
                  .map((message, idx) => (
                    <EmailMessage
                      key={message.id}
                      message={message}
                      index={idx}
                      isLast={idx === thread.messages.length - 1}
                      threadSubject={thread.subject || undefined}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <svg
                  className="h-12 w-12 mx-auto mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-lg font-medium">No email messages yet</p>
                <p className="text-sm">
                  Messages will appear here once they&apos;re processed
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - Right Side */}
          <div className="w-80 shrink-0 space-y-6">
            {/* Thread Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5" />
                Thread Status
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Status
                  </div>
                  <Badge
                    variant={getStatusVariant(thread.status)}
                    className="text-sm"
                  >
                    {thread.status.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Intent
                  </div>
                  {thread.intent ? (
                    <Badge variant="outline">{thread.intent}</Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
                {thread.workflowRunId && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Workflow Run ID
                    </div>
                    <code className="font-mono text-xs bg-muted px-2 py-1 rounded block">
                      {thread.workflowRunId}
                    </code>
                  </div>
                )}
              </div>
            </div>

            {/* Participants */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participants ({thread.participants.length})
              </h3>
              <div className="space-y-2">
                {thread.participants.map((email, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm truncate">{email}</span>
                  </div>
                ))}
                {thread.participants.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No participants found
                  </p>
                )}
              </div>
            </div>

            {/* Proposed Time Slots */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Proposed Time Slots
              </h3>
              {proposedSlots && proposedSlots.length > 0 ? (
                <div className="space-y-3">
                  {proposedSlots.map((slot, idx) => (
                    <div key={idx} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm">
                          Option {idx + 1}
                        </div>
                        {slot.score && (
                          <Badge variant="outline" className="text-xs">
                            {slot.score}%
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1 text-xs">
                        <div>
                          <span className="text-muted-foreground">Start:</span>{" "}
                          {format(new Date(slot.start), "MMM d, h:mm a")}
                        </div>
                        <div>
                          <span className="text-muted-foreground">End:</span>{" "}
                          {format(new Date(slot.end), "MMM d, h:mm a")}
                        </div>
                        {slot.reason && (
                          <p className="text-muted-foreground mt-2 text-xs">
                            {slot.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No proposed time slots yet
                </p>
              )}
            </div>

            {/* Related Meetings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Related Meetings ({thread.meetings.length})
              </h3>
              {thread.meetings.length > 0 ? (
                <div className="space-y-3">
                  {thread.meetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">
                          {meeting.title}
                        </span>
                        <Badge
                          variant={getMeetingStatusVariant(meeting.status)}
                          className="text-xs"
                        >
                          {meeting.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mb-3">
                        {format(
                          new Date(meeting.startTime),
                          "MMM d, yyyy 'at' h:mm a"
                        )}
                      </div>
                      {meeting.meetingLink && (
                        <div className="mb-3">
                          <a
                            href={meeting.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Join Meeting
                          </a>
                        </div>
                      )}
                      <Link href={`/meetings/${meeting.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                        >
                          View Details
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No meetings created yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
