"use client";

import * as React from "react";
import { format, isSameDay } from "date-fns";
import {
  Clock,
  Users,
  Video,
  ExternalLink,
  Plus,
  Calendar as CalendarIconLucide,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CalendarMeeting } from "../actions";

interface SidebarProps {
  selectedDate: Date;
  meetings: CalendarMeeting[];
  onAddEvent?: (date: Date) => void;
}

export function CalendarSidebar({
  selectedDate,
  meetings,
  onAddEvent,
}: SidebarProps) {
  const filteredMeetings = meetings.filter((m) =>
    isSameDay(new Date(m.startTime), selectedDate),
  );

  return (
    <div className="flex flex-col h-full border-l border-border/10 bg-muted/5 backdrop-blur-sm">
      <div className="p-6 border-b border-border/10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-tech text-[10px] font-bold tracking-[0.2em] text-primary uppercase">
            Selected Vector
          </h3>
          <Badge
            variant="outline"
            className="font-tech text-[8px] border-primary/20 text-primary"
          >
            {filteredMeetings.length} TASKS
          </Badge>
        </div>
        <h2 className="text-2xl font-tech font-bold tracking-tight">
          {format(selectedDate, "EEE, MMM d")}
        </h2>
      </div>

      <ScrollArea className="flex-1 p-6">
        {filteredMeetings.length > 0 ? (
          <div className="space-y-6">
            {filteredMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="group relative flex flex-col gap-3 p-4 rounded-2xl border border-border/10 bg-card/40 hover:bg-card/60 transition-all duration-300 hover:border-primary/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          meeting.status === "confirmed"
                            ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                            : "bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]",
                        )}
                      />
                      <span className="text-[10px] font-tech font-bold text-muted-foreground uppercase tracking-widest">
                        {format(new Date(meeting.startTime), "HH:mm")}
                      </span>
                    </div>
                    <h4 className="font-tech font-bold text-sm tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {meeting.title.toUpperCase()}
                    </h4>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-tech text-[8px] tracking-widest border-none px-2",
                      meeting.status === "confirmed"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-primary/10 text-primary",
                    )}
                  >
                    {meeting.status.toUpperCase()}
                  </Badge>
                </div>

                {meeting.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 italic">
                    {meeting.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 mt-1">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground/70 uppercase">
                    <Clock className="w-3 h-3 text-primary/60" />
                    <span>
                      {format(new Date(meeting.startTime), "h:mm a")} -{" "}
                      {format(new Date(meeting.endTime), "h:mm a")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground/70 uppercase">
                    <Users className="w-3 h-3 text-primary/60" />
                    <span>{meeting.participants} PERSONS</span>
                  </div>
                </div>

                {meeting.meetingLink && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 font-tech text-[9px] tracking-widest h-8 border-border/40 hover:bg-primary hover:text-primary-foreground group-hover:border-primary/30"
                    asChild
                  >
                    <a
                      href={meeting.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Video className="w-3 h-3 mr-2" />
                      INITIATE LINK
                      <ExternalLink className="w-2.5 h-2.5 ml-auto opacity-50" />
                    </a>
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-border/5 rounded-3xl opacity-40">
            <CalendarIconLucide className="w-8 h-8 mb-3 text-muted-foreground" />
            <p className="font-tech text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              No nodes detected
            </p>
          </div>
        )}
      </ScrollArea>

      <div className="p-6 border-t border-border/10 bg-background/40">
        <Button
          className="w-full font-tech font-bold tracking-[0.2em] text-[10px] h-11 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
          onClick={() => onAddEvent?.(selectedDate)}
        >
          <Plus className="w-4 h-4 mr-2" />
          GENERATE TASK
        </Button>
      </div>
    </div>
  );
}
