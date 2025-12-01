import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { EmailThreadModel } from "@/prisma/generated/prisma/models/EmailThread";
import type { MeetingModel } from "@/prisma/generated/prisma/models/Meeting";

type EmailThreadWithMeetings = EmailThreadModel & {
  meetings: MeetingModel[];
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

export function EmailThreadDetail({ thread }: EmailThreadDetailProps) {
  const proposedSlots = thread.proposedSlots as ProposedSlot[] | null;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="max-w-4xl mx-auto w-full">
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

        <div className="grid gap-6 md:grid-cols-2">
          {/* Status & Intent Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5" />
                Status & Intent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-6">
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge
                    variant={getStatusVariant(thread.status)}
                    className="mt-1"
                  >
                    {thread.status.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Intent</div>
                  {thread.intent ? (
                    <Badge variant="outline" className="mt-1">
                      {thread.intent}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>

              {thread.workflowRunId && (
                <div>
                  <div className="text-sm text-muted-foreground">
                    Workflow Run ID
                  </div>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {thread.workflowRunId}
                  </code>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Participants Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Participants ({thread.participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {thread.participants.map((email, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 rounded-md bg-muted/50"
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
            </CardContent>
          </Card>

          {/* Proposed Slots Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                Proposed Time Slots
              </CardTitle>
            </CardHeader>
            <CardContent>
              {proposedSlots && proposedSlots.length > 0 ? (
                <div className="space-y-3">
                  {proposedSlots.map((slot, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-md border bg-muted/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">
                          Option {idx + 1}
                          {slot.score && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Score: {slot.score}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-sm mt-1">
                        <span className="text-muted-foreground">Start:</span>{" "}
                        {format(
                          new Date(slot.start),
                          "MMM d, yyyy 'at' h:mm a"
                        )}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">End:</span>{" "}
                        {format(new Date(slot.end), "MMM d, yyyy 'at' h:mm a")}
                      </div>
                      {slot.reason && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {slot.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No proposed time slots yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Related Meetings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Related Meetings ({thread.meetings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {thread.meetings.length > 0 ? (
                <div className="space-y-3">
                  {thread.meetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="p-3 rounded-md border bg-muted/30"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{meeting.title}</span>
                        <Badge
                          variant={getMeetingStatusVariant(meeting.status)}
                        >
                          {meeting.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {format(
                          new Date(meeting.startTime),
                          "MMM d, yyyy 'at' h:mm a"
                        )}
                      </div>
                      <Link href={`/meetings/${meeting.id}`}>
                        <Button variant="outline" size="sm" className="mt-2">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Meeting
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No meetings created from this thread yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Metadata */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Created:</span>{" "}
                {format(new Date(thread.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </div>
              <div>
                <span className="font-medium">Updated:</span>{" "}
                {format(new Date(thread.updatedAt), "MMM d, yyyy 'at' h:mm a")}{" "}
                (
                {formatDistanceToNow(new Date(thread.updatedAt), {
                  addSuffix: true,
                })}
                )
              </div>
              <div>
                <span className="font-medium">ID:</span> {thread.id}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
