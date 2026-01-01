import Link from "next/link";
import { format, isToday, isTomorrow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Calendar,
  Users,
  Mail,
  MapPin,
  ExternalLink,
  Video,
  CheckCircle,
  AlertCircle,
  XCircle,
  Globe,
  MessageSquare,
  Calendar as CalendarIcon,
  Timer,
  Copy,
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
  > | null;
};

interface MeetingDetailProps {
  meeting: MeetingWithThread;
}

function getStatusConfig(status: string) {
  switch (status) {
    case "confirmed":
      return {
        variant: "default" as const,
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        label: "Confirmed",
        description: "This meeting is confirmed and ready to go",
      };
    case "proposed":
      return {
        variant: "secondary" as const,
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: AlertCircle,
        label: "Proposed",
        description: "This meeting needs confirmation",
      };
    case "cancelled":
      return {
        variant: "destructive" as const,
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
        label: "Cancelled",
        description: "This meeting has been cancelled",
      };
    default:
      return {
        variant: "secondary" as const,
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: AlertCircle,
        label: status,
        description: "Meeting status unknown",
      };
  }
}

function getSourceConfig(source: string) {
  switch (source) {
    case "email_thread":
      return {
        icon: Mail,
        label: "From Email Thread",
        color: "text-blue-600",
        description: "Created from an email conversation",
      };
    case "chat_assistant":
      return {
        icon: MessageSquare,
        label: "From Chat Assistant",
        color: "text-purple-600",
        description: "Scheduled via AI chat assistant",
      };
    default:
      return {
        icon: Globe,
        label: "Manual Entry",
        color: "text-gray-600",
        description: "Manually created meeting",
      };
  }
}

function getTimeUntilMeeting(startTime: Date): string {
  const now = new Date();
  const diffMs = startTime.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMs < 0) {
    return "Meeting has started";
  }

  if (diffMinutes < 60) {
    return `Starts in ${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""}`;
  }

  if (diffHours < 24) {
    return `Starts in ${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
  }

  return `Starts in ${diffDays} day${diffDays !== 1 ? "s" : ""}`;
}

function formatMeetingDate(startTime: Date): string {
  if (isToday(startTime)) {
    return `Today, ${format(startTime, "MMMM d, yyyy")}`;
  }

  if (isTomorrow(startTime)) {
    return `Tomorrow, ${format(startTime, "MMMM d, yyyy")}`;
  }

  return format(startTime, "EEEE, MMMM d, yyyy");
}

export function MeetingDetail({ meeting }: MeetingDetailProps) {
  const startTime = new Date(meeting.startTime);
  const endTime = new Date(meeting.endTime);
  const duration = Math.round(
    (endTime.getTime() - startTime.getTime()) / (1000 * 60)
  );
  const statusConfig = getStatusConfig(meeting.status);
  const sourceConfig = getSourceConfig(meeting.source);
  const StatusIcon = statusConfig.icon;
  const SourceIcon = sourceConfig.icon;
  const timeUntil = getTimeUntilMeeting(startTime);

  const isUpcoming = startTime > new Date();
  const isInProgress = startTime <= new Date() && endTime > new Date();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8 lg:px-8 xl:px-12 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/meetings">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 hover:bg-white/50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Meetings
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              {meeting.meetingLink && (
                <Button asChild className="shadow-sm">
                  <Link
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Join Meeting
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="sm" className="shadow-sm">
                <Copy className="h-4 w-4 mr-2" />
                Copy Details
              </Button>
            </div>
          </div>

          {/* Status Banner */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 ${
              isInProgress
                ? "bg-blue-100 text-blue-800 border border-blue-200"
                : isUpcoming
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-gray-100 text-gray-800 border border-gray-200"
            }`}
          >
            <StatusIcon className="h-4 w-4" />
            {statusConfig.label}
            {isInProgress && (
              <>
                <span className="mx-1">•</span>
                <span>In Progress</span>
              </>
            )}
          </div>

          {/* Meeting Title & Description */}
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
              {meeting.title}
            </h1>
            {meeting.description && (
              <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
                {meeting.description}
              </p>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Primary Content - Left 2/3 */}
          <div className="lg:col-span-2 space-y-8">
            {/* Key Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date & Time Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Date & Time</h3>
                </div>
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatMeetingDate(startTime)}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="font-medium">
                      {format(startTime, "h:mm a")} -{" "}
                      {format(endTime, "h:mm a")}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      {duration} minutes
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {meeting.timezone}
                    </span>
                  </div>
                  {isUpcoming && (
                    <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-lg inline-block">
                      {timeUntil}
                    </div>
                  )}
                </div>
              </div>

              {/* Participants Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Participants</h3>
                  <Badge variant="secondary" className="ml-auto">
                    {meeting.participants.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {meeting.participants.length === 0 ? (
                    <div className="text-gray-500 text-sm">
                      No participants added yet
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {meeting.participants
                            .slice(0, 4)
                            .map((email, idx) => (
                              <Avatar
                                key={idx}
                                className="h-8 w-8 border-2 border-white shadow-sm"
                              >
                                <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                                  {email.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                        </div>
                        {meeting.participants.length > 4 && (
                          <span className="text-sm text-gray-500 ml-2">
                            +{meeting.participants.length - 4} more
                          </span>
                        )}
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {meeting.participants.slice(0, 3).map((email, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 text-sm"
                          >
                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                            <span className="text-gray-600 truncate">
                              {email}
                            </span>
                            {idx === 0 && (
                              <Badge
                                variant="outline"
                                className="text-xs ml-auto"
                              >
                                Organizer
                              </Badge>
                            )}
                          </div>
                        ))}
                        {meeting.participants.length > 3 && (
                          <div className="text-sm text-gray-500 text-center py-1">
                            +{meeting.participants.length - 3} more participants
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Meeting Timeline */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Timer className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Meeting Timeline
                </h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full shadow-sm"></div>
                    <div className="w-px h-12 bg-gray-200"></div>
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="font-semibold text-gray-900 mb-1">
                      Meeting Created
                    </div>
                    <div className="text-sm text-gray-600">
                      {format(
                        new Date(meeting.createdAt),
                        'EEEE, MMMM d, yyyy "at" h:mm a'
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-4 h-4 rounded-full shadow-sm ${
                        meeting.status === "confirmed"
                          ? "bg-green-500"
                          : meeting.status === "proposed"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                    <div className="w-px h-12 bg-gray-200"></div>
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="font-semibold text-gray-900 mb-1">
                      Status: {statusConfig.label}
                    </div>
                    <div className="text-sm text-gray-600">
                      {meeting.status === "confirmed"
                        ? "Meeting confirmed and ready"
                        : meeting.status === "proposed"
                        ? "Awaiting confirmation"
                        : "Meeting has been cancelled"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div
                    className={`w-4 h-4 rounded-full shadow-sm ${
                      isUpcoming
                        ? "bg-blue-500"
                        : isInProgress
                        ? "bg-green-500"
                        : "bg-gray-500"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1">
                      {isUpcoming
                        ? "Upcoming Meeting"
                        : isInProgress
                        ? "Meeting in Progress"
                        : "Meeting Completed"}
                    </div>
                    <div className="text-sm text-gray-600">
                      {format(startTime, "EEEE, MMMM d, yyyy 'at' h:mm a")}
                      {isUpcoming && ` • ${timeUntil}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Right 1/3 */}
          <div className="space-y-6">
            {/* Meeting Source Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 rounded-lg ${sourceConfig.color
                    .replace("text-", "bg-")
                    .replace("-600", "-50")}`}
                >
                  <SourceIcon className={`h-5 w-5 ${sourceConfig.color}`} />
                </div>
                <h3 className="font-semibold text-gray-900">Meeting Source</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Origin</div>
                  <div className="font-medium text-gray-900">
                    {sourceConfig.label}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {sourceConfig.description}
                  </p>
                </div>

                {meeting.emailThread && (
                  <>
                    <div className="border-t border-gray-100 pt-3">
                      <div className="text-sm text-gray-500 mb-1">
                        Source Email
                      </div>
                      <div className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
                        {meeting.emailThread.subject || "No subject"}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                        <span>Status: {meeting.emailThread.status}</span>
                        {meeting.emailThread.intent && (
                          <span>Intent: {meeting.emailThread.intent}</span>
                        )}
                      </div>
                      <Link href={`/email-threads/${meeting.emailThread.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Email Thread
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Calendar & Sync Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Calendar & Sync</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-2">
                    Calendar Status
                  </div>
                  {meeting.calendarEventId ? (
                    <div className="space-y-2">
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Synced to Calendar
                      </Badge>
                      <p className="text-xs text-gray-600">
                        Event ID: {meeting.calendarEventId}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Badge variant="secondary">Not Synced</Badge>
                      <p className="text-xs text-gray-600">
                        This meeting hasn&apos;t been added to your calendar
                        yet.
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Add to Calendar
                      </Button>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="text-sm text-gray-500 mb-1">Meeting ID</div>
                  <div className="font-mono text-xs bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg border">
                    {meeting.id}
                  </div>
                </div>
              </div>
            </div>

            {/* Participants Details Card */}
            {meeting.participants.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    All Participants
                  </h3>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {meeting.participants.map((email, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                          {email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {email}
                        </div>
                        <div className="text-xs text-gray-500">
                          {idx === 0 ? "Organizer" : "Attendee"}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-60 hover:opacity-100"
                      >
                        <Mail className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Metadata */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-wrap gap-8 text-sm text-gray-500">
            <div>
              <span className="font-medium text-gray-700">Created:</span>{" "}
              {format(new Date(meeting.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </div>
            <div>
              <span className="font-medium text-gray-700">Last Updated:</span>{" "}
              {format(new Date(meeting.updatedAt), "MMM d, yyyy 'at' h:mm a")}
            </div>
            <div>
              <span className="font-medium text-gray-700">Source:</span>{" "}
              {sourceConfig.label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
