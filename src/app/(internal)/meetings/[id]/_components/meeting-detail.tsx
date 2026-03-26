import Link from "next/link";
import { format, isToday, isTomorrow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Users,
  Mail,
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
  Clock,
  Zap,
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
        color: "bg-green-500/10 text-green-500 border-green-500/20",
        icon: CheckCircle,
        label: "Confirmed",
        description: "This meeting is confirmed and ready to go",
      };
    case "proposed":
      return {
        variant: "secondary" as const,
        color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        icon: AlertCircle,
        label: "Proposed",
        description: "This meeting needs confirmation",
      };
    case "cancelled":
      return {
        variant: "destructive" as const,
        color: "bg-red-500/10 text-red-500 border-red-500/20",
        icon: XCircle,
        label: "Cancelled",
        description: "This meeting has been cancelled",
      };
    default:
      return {
        variant: "secondary" as const,
        color: "bg-muted text-muted-foreground border-border",
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
        color: "text-primary",
        description: "Created from an email conversation",
      };
    case "chat_assistant":
      return {
        icon: MessageSquare,
        label: "From Chat Assistant",
        color: "text-primary",
        description: "Scheduled via AI chat assistant",
      };
    default:
      return {
        icon: Globe,
        label: "Manual Entry",
        color: "text-muted-foreground",
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
  const sourceConfig = getSourceConfig(meeting.source);
  const SourceIcon = sourceConfig.icon;
  const timeUntil = getTimeUntilMeeting(startTime);

  const isUpcoming = startTime > new Date();
  const isInProgress = startTime <= new Date() && endTime > new Date();

  return (
    <div className="min-h-screen bg-background bg-[radial-gradient(ellipse_at_top_left,rgba(var(--primary-rgb),0.03),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(var(--accent-rgb),0.03),transparent_50%)]">
      <div className="container mx-auto px-4 py-8 lg:px-8 xl:px-12 max-w-7xl space-y-8">
        {/* Header Section */}
        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <Link href="/meetings">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 hover:bg-card/50 font-tech text-[10px] tracking-widest uppercase"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Missions
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              {meeting.meetingLink && (
                <Button asChild className="shadow-lg shadow-primary/20 font-tech text-xs tracking-widest px-6 bg-primary hover:bg-primary/90">
                  <Link
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    JOIN SESSION
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="sm" className="shadow-sm font-tech text-[10px] tracking-widest border-border/60">
                <Copy className="h-4 w-4 mr-2" />
                COPY DATA
              </Button>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex flex-wrap items-center gap-3">
              <Badge 
                variant={statusConfig.variant}
                className={cn(
                  "font-tech text-[10px] tracking-[0.2em] px-3 py-1 uppercase border-none",
                  isInProgress ? "bg-blue-500 animate-pulse" : 
                  isUpcoming ? "bg-green-500" : "bg-muted text-muted-foreground"
                )}
              >
                {statusConfig.label} {isInProgress && "• ACTIVE"}
              </Badge>
              <Badge variant="outline" className="font-tech text-[10px] tracking-widest px-3 py-1 border-primary/20 text-primary/70 bg-primary/5 uppercase">
                {meeting.source.replace("_", " ")}
              </Badge>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-tech font-bold tracking-tight text-foreground leading-tight max-w-4xl">
              {meeting.title}
            </h1>
            
            {meeting.description && (
              <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed font-medium">
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
              <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-8 shadow-xl group transition-all duration-500 hover:border-primary/40">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                  <Calendar className="h-24 w-24 -mr-8 -mt-8 rotate-12" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-tech text-xs font-bold tracking-widest uppercase text-muted-foreground">Schedule</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="text-3xl font-tech font-bold tracking-tight text-foreground">
                      {formatMeetingDate(startTime)}
                    </div>
                    <div className="flex items-center gap-3 text-lg font-medium text-foreground">
                      <span className="bg-muted/50 px-3 py-1 rounded-lg border border-border/40">
                        {format(startTime, "h:mm a")}
                      </span>
                      <span className="text-muted-foreground/40">—</span>
                      <span className="bg-muted/50 px-3 py-1 rounded-lg border border-border/40">
                        {format(endTime, "h:mm a")}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Timer className="h-3.5 w-3.5 text-primary/60" />
                        {duration} MIN SESSION
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Globe className="h-3.5 w-3.5 text-primary/60" />
                        {meeting.timezone}
                      </div>
                    </div>
                    {isUpcoming && (
                      <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[10px] font-tech font-bold tracking-widest uppercase">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        {timeUntil}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Participants Card */}
              <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-8 shadow-xl group transition-all duration-500 hover:border-primary/40">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                  <Users className="h-24 w-24 -mr-8 -mt-8 rotate-12" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-tech text-xs font-bold tracking-widest uppercase text-muted-foreground">Personnel</h3>
                    <Badge variant="secondary" className="ml-auto font-tech text-[10px] bg-primary/10 text-primary border-none">
                      {meeting.participants.length}
                    </Badge>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-3">
                        {meeting.participants.slice(0, 5).map((email, idx) => (
                          <Avatar key={idx} className="h-10 w-10 border-4 border-card shadow-lg">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold font-tech">
                              {email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {meeting.participants.length > 5 && (
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border-4 border-card text-[10px] font-tech font-bold shadow-lg">
                            +{meeting.participants.length - 5}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
                      {meeting.participants.map((email, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3 p-2 rounded-xl bg-muted/30 border border-border/40 group/item hover:bg-muted/50 transition-colors">
                          <span className="text-xs font-medium truncate text-foreground/80">{email}</span>
                          {idx === 0 && (
                            <Badge variant="outline" className="font-tech text-[8px] tracking-widest uppercase px-1.5 py-0 border-primary/30 text-primary/60">
                              ORG
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Meeting Timeline */}
            <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-tech text-xs font-bold tracking-widest uppercase text-muted-foreground">Session Lifecycle</h3>
              </div>
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-2 before:-translate-x-px before:h-full before:w-0.5 before:bg-linear-to-b before:from-primary/50 before:via-border/50 before:to-transparent">
                <div className="relative flex items-center gap-6 group">
                  <div className="absolute left-0 h-4 w-4 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)] ring-4 ring-primary/10" />
                  <div className="flex-1 ml-6 p-4 rounded-xl bg-muted/30 border border-border/40 group-hover:bg-muted/50 transition-colors">
                    <div className="font-tech text-[10px] tracking-widest uppercase text-primary mb-1">Initialization</div>
                    <div className="text-sm font-bold text-foreground mb-1">Meeting Created</div>
                    <div className="text-xs text-muted-foreground font-medium">
                      {format(new Date(meeting.createdAt), 'MMM d, yyyy • h:mm a')}
                    </div>
                  </div>
                </div>

                <div className="relative flex items-center gap-6 group">
                  <div className={cn(
                    "absolute left-0 h-4 w-4 -translate-x-1/2 rounded-full shadow-lg ring-4",
                    statusConfig.variant === "default" ? "bg-green-500 ring-green-500/10" : "bg-yellow-500 ring-yellow-500/10"
                  )} />
                  <div className="flex-1 ml-6 p-4 rounded-xl bg-muted/30 border border-border/40 group-hover:bg-muted/50 transition-colors">
                    <div className="font-tech text-[10px] tracking-widest uppercase text-muted-foreground mb-1">Current State</div>
                    <div className="text-sm font-bold text-foreground mb-1">Status: {statusConfig.label.toUpperCase()}</div>
                    <div className="text-xs text-muted-foreground font-medium">
                      {statusConfig.description}
                    </div>
                  </div>
                </div>

                <div className="relative flex items-center gap-6 group">
                  <div className={cn(
                    "absolute left-0 h-4 w-4 -translate-x-1/2 rounded-full shadow-lg ring-4",
                    isUpcoming ? "bg-primary ring-primary/10" : "bg-muted ring-muted/10"
                  )} />
                  <div className="flex-1 ml-6 p-4 rounded-xl bg-muted/30 border border-border/40 group-hover:bg-muted/50 transition-colors">
                    <div className="font-tech text-[10px] tracking-widest uppercase text-muted-foreground mb-1">Execution</div>
                    <div className="text-sm font-bold text-foreground mb-1">
                      {isUpcoming ? "Upcoming Session" : isInProgress ? "Active Session" : "Session Completed"}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
                      {format(startTime, "MMM d, yyyy • h:mm a")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Right 1/3 */}
          <div className="space-y-8">
            {/* Meeting Source Card */}
            <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 shadow-xl group">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <SourceIcon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-tech text-xs font-bold tracking-widest uppercase text-muted-foreground">Source Node</h3>
              </div>
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
                  <div className="font-tech text-[10px] tracking-widest uppercase text-primary mb-1">Protocol</div>
                  <div className="text-sm font-bold text-foreground">{sourceConfig.label}</div>
                  <p className="text-xs text-muted-foreground mt-2 font-medium leading-relaxed">
                    {sourceConfig.description}
                  </p>
                </div>

                {meeting.emailThread && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
                      <div className="font-tech text-[10px] tracking-widest uppercase text-primary mb-1">Linked Thread</div>
                      <div className="text-sm font-bold text-foreground line-clamp-2 mb-2">
                        {meeting.emailThread.subject || "No subject"}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-tech text-[8px] tracking-widest uppercase px-1.5 py-0 border-primary/20 text-primary/60">
                          {meeting.emailThread.status}
                        </Badge>
                      </div>
                    </div>
                    <Link href={`/email-threads/${meeting.emailThread.id}`} className="block">
                      <Button variant="outline" size="sm" className="w-full font-tech text-[10px] tracking-widest border-border/60 hover:bg-primary hover:text-primary-foreground transition-all">
                        <ExternalLink className="h-3.5 w-3.5 mr-2" />
                        OPEN THREAD
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Calendar & Sync Card */}
            <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 shadow-xl group">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-tech text-xs font-bold tracking-widest uppercase text-muted-foreground">Synchronization</h3>
              </div>
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
                  <div className="font-tech text-[10px] tracking-widest uppercase text-primary mb-2">Calendar Status</div>
                  {meeting.calendarEventId ? (
                    <div className="space-y-3">
                      <Badge className="bg-green-500/10 text-green-500 font-tech text-[9px] tracking-widest uppercase border-green-500/20">
                        <CheckCircle className="h-3 w-3 mr-1.5" />
                        SYNCED
                      </Badge>
                      <div className="font-mono text-[10px] text-muted-foreground break-all bg-background/50 p-2 rounded border border-border/40">
                        ID: {meeting.calendarEventId}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Badge variant="secondary" className="font-tech text-[9px] tracking-widest uppercase">OFFLINE</Badge>
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                        This session is not yet synchronized with your primary calendar node.
                      </p>
                      <Button variant="outline" size="sm" className="w-full font-tech text-[10px] tracking-widest border-border/60 hover:bg-primary hover:text-primary-foreground transition-all">
                        <CalendarIcon className="h-3.5 w-3.5 mr-2" />
                        PUSH TO CALENDAR
                      </Button>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
                  <div className="font-tech text-[10px] tracking-widest uppercase text-primary mb-1">Internal Reference</div>
                  <div className="font-mono text-[10px] text-muted-foreground break-all">
                    {meeting.id}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Metadata */}
        <div className="border-t border-border/40 pt-8 pb-12">
          <div className="flex flex-wrap gap-x-12 gap-y-4 font-tech text-[10px] tracking-widest uppercase text-muted-foreground/60">
            <div className="flex items-center gap-2">
              <span className="font-bold text-primary/60">Initialized:</span>
              {format(new Date(meeting.createdAt), "MMM d, yyyy")}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-primary/60">Last Sync:</span>
              {format(new Date(meeting.updatedAt), "MMM d, yyyy")}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-primary/60">Node:</span>
              {sourceConfig.label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
