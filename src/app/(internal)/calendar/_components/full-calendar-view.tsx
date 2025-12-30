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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 bg-muted/50 border-b">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
            <div
              key={dayName}
              className="py-3 text-center text-sm font-medium text-muted-foreground"
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
                        "min-h-[120px] p-2 border-b border-r text-left transition-colors hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset",
                        !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                        isToday && "bg-accent/30",
                        isSelected && "ring-2 ring-primary ring-inset"
                      )}
                    >
                      {/* Date Number */}
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={cn(
                            "inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full",
                            isToday && "bg-primary text-primary-foreground",
                            !isCurrentMonth && "text-muted-foreground"
                          )}
                        >
                          {format(date, "d")}
                        </span>
                      </div>

                      {/* Events */}
                      <div className="space-y-1">
                        {meetings.slice(0, 3).map((meeting) => (
                          <div
                            key={meeting.id}
                            className={cn(
                              "text-xs px-2 py-1 rounded truncate font-medium",
                              meeting.status === "confirmed"
                                ? "bg-green-500/20 text-green-700 dark:text-green-400"
                                : "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                            )}
                          >
                            <span className="mr-1">
                              {format(meeting.startTime, "h:mm a")}
                            </span>
                            {meeting.title}
                          </div>
                        ))}
                        {meetings.length > 3 && (
                          <div className="text-xs text-muted-foreground px-2">
                            +{meetings.length - 3} more
                          </div>
                        )}
                      </div>
                    </button>
                  </PopoverTrigger>

                  {/* Popover for meeting details */}
                  {meetings.length > 0 && (
                    <PopoverContent
                      className="w-80 p-0"
                      side="right"
                      align="start"
                    >
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <h4 className="font-semibold">
                            {format(date, "EEEE, MMMM d, yyyy")}
                          </h4>
                        </div>

                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {meetings.map((meeting) => (
                            <div
                              key={meeting.id}
                              className="p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm line-clamp-2">
                                    {meeting.title}
                                  </p>
                                  {meeting.description && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                      {meeting.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      <span>
                                        {format(meeting.startTime, "h:mm a")} -{" "}
                                        {format(meeting.endTime, "h:mm a")}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                    <Users className="h-3 w-3" />
                                    <span>
                                      {meeting.participants} participant
                                      {meeting.participants !== 1 ? "s" : ""}
                                    </span>
                                  </div>
                                </div>
                                <Badge
                                  variant={
                                    meeting.status === "confirmed"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className={cn(
                                    "shrink-0 text-xs",
                                    meeting.status === "confirmed"
                                      ? "bg-green-500 hover:bg-green-600"
                                      : ""
                                  )}
                                >
                                  {meeting.status}
                                </Badge>
                              </div>

                              {meeting.meetingLink && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full mt-2 h-8 text-xs"
                                  asChild
                                >
                                  <a
                                    href={meeting.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1"
                                  >
                                    <Video className="h-3 w-3" />
                                    Join Meeting
                                    <ExternalLink className="h-3 w-3 ml-auto" />
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
    <div className="mt-8 border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Today&apos;s Schedule</h3>
          <span className="text-sm text-muted-foreground">
            {format(today, "EEEE, MMMM d")}
          </span>
        </div>
        {todayMeetings.length > 0 && (
          <Badge variant="secondary">
            {todayMeetings.length} meeting
            {todayMeetings.length !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {todayMeetings.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No meetings scheduled for today</p>
          <p className="text-xs mt-1">Enjoy your free day!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {todayMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg border transition-colors hover:bg-accent/50",
                meeting.status === "confirmed"
                  ? "border-l-4 border-l-green-500"
                  : "border-l-4 border-l-amber-500"
              )}
            >
              {/* Time */}
              <div className="text-center min-w-[80px]">
                <div className="text-sm font-medium">
                  {format(meeting.startTime, "h:mm a")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(meeting.endTime, "h:mm a")}
                </div>
              </div>

              {/* Divider */}
              <div className="h-12 w-px bg-border" />

              {/* Meeting Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{meeting.title}</p>
                  <Badge
                    variant={
                      meeting.status === "confirmed" ? "default" : "secondary"
                    }
                    className={cn(
                      "text-xs",
                      meeting.status === "confirmed"
                        ? "bg-green-500 hover:bg-green-600"
                        : ""
                    )}
                  >
                    {meeting.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    <span>
                      {meeting.participants} participant
                      {meeting.participants !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {Math.round(
                        (new Date(meeting.endTime).getTime() -
                          new Date(meeting.startTime).getTime()) /
                          60000
                      )}{" "}
                      min
                    </span>
                  </div>
                </div>
              </div>

              {/* Join Button */}
              {meeting.meetingLink && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Video className="h-4 w-4" />
                    Join
                  </a>
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t flex items-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/50" />
          <span>Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/50" />
          <span>Proposed</span>
        </div>
      </div>
    </div>
  );
}
