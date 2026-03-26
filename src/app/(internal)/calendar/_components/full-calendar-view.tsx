"use client";

import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  Clock,
  Users,
  Video,
  ExternalLink,
  Zap,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { getMeetingsForMonth } from "../actions";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function FullCalendarView() {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

  // SWR for meetings in current month
  const { data: meetingsByDate = {} } = useSWR(
    `calendar-meetings-${currentMonth.getFullYear()}-${currentMonth.getMonth()}`,
    () =>
      getMeetingsForMonth(currentMonth.getFullYear(), currentMonth.getMonth())
  );

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const getDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = new Date();

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-tech font-bold tracking-tight text-foreground">
            {format(currentMonth, "MMMM yyyy").toUpperCase()}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToToday}
            className="font-tech text-[10px] tracking-widest border-border/60 hover:bg-primary hover:text-primary-foreground transition-all"
          >
            TODAY
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={goToPreviousMonth}
            className="border-border/60 hover:bg-muted/50"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={goToNextMonth}
            className="border-border/60 hover:bg-muted/50"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border border-border/40 rounded-2xl overflow-hidden shadow-2xl bg-background/20 backdrop-blur-sm">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 bg-muted/30 border-b border-border/40">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
            <div
              key={dayName}
              className="py-4 text-center text-[10px] font-tech font-bold tracking-[0.2em] text-muted-foreground uppercase"
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {weeks.map((week, weekIndex) =>
            week.map((date, dayIndex) => {
              const dateKey = getDateKey(date);
              const meetings = meetingsByDate[dateKey] || [];
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const isToday = isSameDay(date, today);
              const isSelected = selectedDate && isSameDay(date, selectedDate);

              return (
                <Popover key={`${weekIndex}-${dayIndex}`}>
                  <PopoverTrigger asChild>
                    <button
                      onClick={() => handleDateClick(date)}
                      className={cn(
                        "min-h-[140px] p-3 border-b border-r border-border/40 text-left transition-all duration-300 hover:bg-primary/5 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:ring-inset group relative",
                        !isCurrentMonth && "bg-muted/10 text-muted-foreground/40",
                        isToday && "bg-primary/[0.02]",
                        isSelected && "bg-primary/[0.05] ring-1 ring-primary/20 ring-inset"
                      )}
                    >
                      {/* Date Number */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={cn(
                            "inline-flex items-center justify-center w-8 h-8 text-xs font-tech font-bold rounded-xl transition-all duration-300",
                            isToday ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110" : "text-muted-foreground group-hover:text-primary",
                            !isCurrentMonth && "opacity-30"
                          )}
                        >
                          {format(date, "d")}
                        </span>
                        {meetings.length > 0 && (
                          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)]" />
                        )}
                      </div>

                      {/* Events */}
                      <div className="space-y-1.5">
                        {meetings.slice(0, 3).map((meeting) => (
                          <div
                            key={meeting.id}
                            className={cn(
                              "text-[10px] px-2 py-1 rounded-lg truncate font-tech font-bold tracking-tight border transition-all duration-300 hover:scale-[1.02]",
                              meeting.status === "confirmed"
                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                : "bg-primary/10 text-primary border-primary/20"
                            )}
                          >
                            <span className="opacity-60 mr-1">
                              {format(meeting.startTime, "h:mm")}
                            </span>
                            {meeting.title.toUpperCase()}
                          </div>
                        ))}
                        {meetings.length > 3 && (
                          <div className="text-[9px] font-tech font-bold text-muted-foreground/60 px-2 tracking-widest">
                            + {meetings.length - 3} MORE
                          </div>
                        )}
                      </div>
                    </button>
                  </PopoverTrigger>

                  {/* Popover for meeting details */}
                  {meetings.length > 0 && (
                    <PopoverContent
                      className="w-85 p-0 border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden"
                      side="right"
                      align="start"
                    >
                      <div className="p-5">
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border/40">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <CalendarIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-tech text-xs font-bold tracking-widest text-muted-foreground uppercase">
                              Temporal Node
                            </h4>
                            <p className="text-sm font-bold text-foreground">
                              {format(date, "EEEE, MMMM d, yyyy")}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {meetings.map((meeting) => (
                            <div
                              key={meeting.id}
                              className="p-4 border border-border/40 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-300 group/item"
                            >
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex-1 min-w-0">
                                  <p className="font-tech font-bold text-sm tracking-tight text-foreground group-hover/item:text-primary transition-colors">
                                    {meeting.title.toUpperCase()}
                                  </p>
                                  {meeting.description && (
                                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                                      {meeting.description}
                                    </p>
                                  )}
                                  <div className="grid grid-cols-1 gap-2 mt-4">
                                    <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-tighter">
                                      <Clock className="h-3.5 w-3.5 text-primary/60" />
                                      <span>
                                        {format(meeting.startTime, "h:mm a")} - {format(meeting.endTime, "h:mm a")}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-tighter">
                                      <Users className="h-3.5 w-3.5 text-primary/60" />
                                      <span>
                                        {meeting.participants} PERSONNEL
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <Badge
                                  variant={meeting.status === "confirmed" ? "default" : "secondary"}
                                  className={cn(
                                    "shrink-0 font-tech text-[8px] tracking-widest uppercase px-2 py-0.5 border-none",
                                    meeting.status === "confirmed" ? "bg-green-500 shadow-lg shadow-green-500/20" : "bg-primary/20 text-primary"
                                  )}
                                >
                                  {meeting.status}
                                </Badge>
                              </div>

                              {meeting.meetingLink && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full mt-2 font-tech text-[10px] tracking-widest border-border/60 hover:bg-primary hover:text-primary-foreground transition-all"
                                  asChild
                                >
                                  <a
                                    href={meeting.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Video className="h-3.5 w-3.5 mr-2" />
                                    ESTABLISH LINK
                                    <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  )}
                </Popover>
              );
            })
          )}
        </div>
      </div>

      {/* Today's Schedule Section */}
      <TodaysSchedule meetingsByDate={meetingsByDate} />
    </div>
  );
}

interface MeetingData {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  participants: number;
  meetingLink: string | null;
  status: string;
  description: string | null;
}

function TodaysSchedule({
  meetingsByDate,
}: {
  meetingsByDate: Record<string, MeetingData[]>;
}) {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const todayMeetings = meetingsByDate[todayKey] || [];

  return (
    <div className="mt-12 relative overflow-hidden rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-8 shadow-xl">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
        <Zap className="h-32 w-32 rotate-12" />
      </div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-tech text-xs font-bold tracking-widest uppercase text-muted-foreground">Active Missions</h3>
            <p className="text-xl font-bold text-foreground">
              {format(today, "EEEE, MMMM d")}
            </p>
          </div>
        </div>
        {todayMeetings.length > 0 && (
          <Badge variant="secondary" className="font-tech text-[10px] tracking-widest px-3 py-1 bg-primary/10 text-primary border-none uppercase">
            {todayMeetings.length} NODE{todayMeetings.length !== 1 ? "S" : ""} ACTIVE
          </Badge>
        )}
      </div>

      {todayMeetings.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border/60">
          <CalendarIcon className="h-16 w-16 mx-auto mb-4 opacity-10" />
          <p className="font-tech text-xs font-bold tracking-widest uppercase text-muted-foreground">No active missions detected</p>
          <p className="text-sm text-muted-foreground/60 mt-2">Enjoy your temporal freedom.</p>
        </div>
      ) : (
        <div className="space-y-4 relative z-10">
          {todayMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className={cn(
                "flex flex-col md:flex-row md:items-center gap-6 p-5 rounded-2xl border transition-all duration-300 hover:border-primary/40 hover:bg-background/40 group",
                meeting.status === "confirmed"
                  ? "border-l-4 border-l-green-500 bg-green-500/[0.02]"
                  : "border-l-4 border-l-primary bg-primary/[0.02]"
              )}
            >
              {/* Time */}
              <div className="flex flex-row md:flex-col items-center md:items-center justify-between md:justify-center min-w-[100px] gap-2">
                <div className="font-tech text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {format(meeting.startTime, "h:mm a")}
                </div>
                <div className="font-tech text-[10px] tracking-widest text-muted-foreground uppercase opacity-60">
                  {format(meeting.endTime, "h:mm a")}
                </div>
              </div>

              {/* Divider */}
              <div className="hidden md:block h-12 w-px bg-border/40" />

              {/* Meeting Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <p className="font-tech font-bold text-lg tracking-tight text-foreground group-hover:text-primary transition-colors uppercase">
                    {meeting.title}
                  </p>
                  <Badge
                    variant={meeting.status === "confirmed" ? "default" : "secondary"}
                    className={cn(
                      "font-tech text-[8px] tracking-widest uppercase border-none",
                      meeting.status === "confirmed"
                        ? "bg-green-500 shadow-lg shadow-green-500/20"
                        : "bg-primary/20 text-primary"
                    )}
                  >
                    {meeting.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 font-medium uppercase tracking-tighter">
                    <Users className="h-3.5 w-3.5 text-primary/60" />
                    <span>
                      {meeting.participants} PERSONNEL
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-medium uppercase tracking-tighter">
                    <Clock className="h-3.5 w-3.5 text-primary/60" />
                    <span>
                      {Math.round(
                        (new Date(meeting.endTime).getTime() -
                          new Date(meeting.startTime).getTime()) /
                          60000
                      )}{" "}
                      MIN SESSION
                    </span>
                  </div>
                </div>
              </div>

              {/* Join Button */}
              {meeting.meetingLink && (
                <Button 
                  size="sm"
                  className="font-tech text-[10px] tracking-widest bg-primary hover:bg-primary/90 shadow-lg shadow-primary/10 px-8 py-5 h-auto"
                  asChild
                >
                  <a
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    JOIN SESSION
                  </a>
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="mt-8 pt-6 border-t border-border/40 flex flex-wrap items-center gap-8 text-[10px] font-tech font-bold tracking-widest uppercase text-muted-foreground/60">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-lg bg-green-500/20 border border-green-500/40 shadow-[0_0_8px_rgba(34,197,94,0.2)]" />
          <span>Confirmed Mission</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-lg bg-primary/20 border border-primary/40 shadow-[0_0_8px_rgba(var(--primary-rgb),0.2)]" />
          <span>Proposed Node</span>
        </div>
      </div>
    </div>
  );
}
