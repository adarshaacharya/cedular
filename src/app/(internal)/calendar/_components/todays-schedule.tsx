"use client";

import * as React from "react";
import { format, isSameDay } from "date-fns";
import {
  Clock,
  Users,
  Video,
  ExternalLink,
  Zap,
  Calendar as CalendarIconLucide,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CalendarMeeting } from "../actions";

interface TodaysScheduleProps {
  selectedDate: Date;
  meetings: CalendarMeeting[];
}

export function TodaysSchedule({
  selectedDate,
  meetings,
}: TodaysScheduleProps) {
  const filteredMeetings = meetings.filter((m) =>
    isSameDay(new Date(m.startTime), selectedDate),
  );
  const isToday = isSameDay(selectedDate, new Date());

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-8 shadow-sm">
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center border border-border">
            <CalendarIconLucide className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-card-foreground flex items-center gap-2">
              Today&rsquo;s Schedule
            </h3>
            <p className="text-sm font-medium text-muted-foreground">
              {format(selectedDate, "EEEE, MMMM d")}
            </p>
          </div>
        </div>
        {filteredMeetings.length > 0 && (
          <Badge
            variant="secondary"
            className="px-3 py-1 bg-muted text-muted-foreground border-none font-medium"
          >
            {filteredMeetings.length}{" "}
            {filteredMeetings.length !== 1 ? "meetings" : "meeting"}
          </Badge>
        )}
      </div>

      {filteredMeetings.length === 0 ? (
        <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed border-border">
          <div className="opacity-20 mb-4 flex justify-center">
            <CalendarIconLucide className="h-12 w-12 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            No meetings scheduled for today
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Enjoy your free day!
          </p>
        </div>
      ) : (
        <div className="space-y-4 relative z-10">
          {filteredMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className={cn(
                "flex flex-col md:flex-row md:items-center gap-6 p-5 rounded-xl border border-border transition-all hover:border-primary/30 hover:shadow-md bg-card group",
              )}
            >
              {/* Time */}
              <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-center min-w-[120px]">
                <div className="text-xl font-bold text-card-foreground">
                  {format(new Date(meeting.startTime), "h:mm a")}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-semibold text-base text-card-foreground group-hover:text-primary transition-colors">
                    {meeting.title}
                  </h4>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-medium border-none px-2 py-0.5",
                      meeting.status === "confirmed"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                    )}
                  >
                    {meeting.status.charAt(0).toUpperCase() +
                      meeting.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>{meeting.participants} personnel</span>
                  </div>
                  {meeting.description && (
                    <div className="text-xs text-muted-foreground/70 truncate max-w-md">
                      {meeting.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              {meeting.meetingLink && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 border-border text-foreground hover:bg-muted transition-all"
                  asChild
                >
                  <a
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Enter Meeting
                  </a>
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="mt-8 pt-6 border-t border-border flex items-center gap-6 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Proposed</span>
        </div>
      </div>
    </div>
  );
}
