import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Mail,
  MapPin,
  ExternalLink,
} from "lucide-react";
import type { MeetingModel } from "@/prisma/generated/prisma/models/Meeting";
import type { EmailThreadModel } from "@/prisma/generated/prisma/models/EmailThread";

type MeetingWithThread = MeetingModel & {
  emailThread: Pick<
    EmailThreadModel,
    | "id"
    | "subject"
    | "threadId"
    | "status"
    | "intent"
    | "participants"
    | "createdAt"
  >;
};

interface MeetingDetailProps {
  meeting: MeetingWithThread;
}

function getStatusVariant(status: string) {
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

export function MeetingDetail({ meeting }: MeetingDetailProps) {
  const startTime = new Date(meeting.startTime);
  const endTime = new Date(meeting.endTime);
  const duration = Math.round(
    (endTime.getTime() - startTime.getTime()) / (1000 * 60)
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6">
          <Link href="/meetings">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Meetings
            </Button>
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {meeting.title}
              </h1>
              {meeting.description && (
                <p className="text-muted-foreground mt-1">
                  {meeting.description}
                </p>
              )}
            </div>
            <Badge
              variant={getStatusVariant(meeting.status)}
              className="text-sm"
            >
              {meeting.status}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Date & Time Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Date</div>
                <div className="text-lg font-medium">
                  {format(startTime, "EEEE, MMMM d, yyyy")}
                </div>
              </div>

              <div className="flex gap-8">
                <div>
                  <div className="text-sm text-muted-foreground">Start</div>
                  <div className="text-lg font-medium">
                    {format(startTime, "h:mm a")}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">End</div>
                  <div className="text-lg font-medium">
                    {format(endTime, "h:mm a")}
                  </div>
                </div>
              </div>

              <div className="flex gap-8">
                <div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{duration} minutes</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Timezone</div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{meeting.timezone}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participants Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Participants ({meeting.participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {meeting.participants.map((email, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 rounded-md bg-muted/50"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm">{email}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Calendar Sync Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Calendar Sync
              </CardTitle>
            </CardHeader>
            <CardContent>
              {meeting.calendarEventId ? (
                <div className="space-y-2">
                  <Badge variant="outline" className="text-green-600">
                    Synced to Calendar
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Event ID: {meeting.calendarEventId}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Badge variant="secondary">Not Synced</Badge>
                  <p className="text-sm text-muted-foreground">
                    This meeting has not been synced to your calendar yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Source Email Thread Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5" />
                Source Email Thread
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">Subject</div>
                  <div className="font-medium">
                    {meeting.emailThread.subject || "No subject"}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <Badge variant="outline">
                      {meeting.emailThread.status}
                    </Badge>
                  </div>
                  {meeting.emailThread.intent && (
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Intent
                      </div>
                      <Badge variant="outline">
                        {meeting.emailThread.intent}
                      </Badge>
                    </div>
                  )}
                </div>

                <Link href={`/email-threads/${meeting.emailThread.id}`}>
                  <Button variant="outline" size="sm" className="mt-2">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Email Thread
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metadata */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex gap-8 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Created:</span>{" "}
                {format(new Date(meeting.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </div>
              <div>
                <span className="font-medium">Updated:</span>{" "}
                {format(new Date(meeting.updatedAt), "MMM d, yyyy 'at' h:mm a")}
              </div>
              <div>
                <span className="font-medium">ID:</span> {meeting.id}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
