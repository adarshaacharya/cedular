"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
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
import { getMeetingsForMonth, type CalendarMeeting } from "../actions";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { TodaysSchedule } from "./todays-schedule";

export function FullCalendarView() {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());

  // SWR for meetings in current month
  const { data: meetingsByDate = {} } = useSWR(
    `calendar-meetings-${currentMonth.getFullYear()}-${currentMonth.getMonth()}`,
    () =>
      getMeetingsForMonth(currentMonth.getFullYear(), currentMonth.getMonth()),
  );

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  // Flatten all meetings for components
  const allMeetings = Object.values(meetingsByDate).flat() as CalendarMeeting[];

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
    <div className="w-full space-y-4">
      {/* Calendar Primary Container */}
      <div className="flex flex-col border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-card-foreground">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="px-4 h-9 font-medium transition-all"
            >
              Today
            </Button>
            <div className="flex items-center gap-1 border border-border rounded-lg p-1 ml-2 bg-background">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPreviousMonth}
                className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-md"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextMonth}
                className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-md"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 bg-muted/30 border-b border-border">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
            <div
              key={dayName}
              className="py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 bg-card">
          {weeks.map((week, weekIndex) =>
            week.map((date, dayIndex) => {
              const dateKey = getDateKey(date);
              const meetings = meetingsByDate[dateKey] || [];
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const isToday = isSameDay(date, today);
              const isSelected = selectedDate && isSameDay(date, selectedDate);

              return (
                <button
                  key={`${weekIndex}-${dayIndex}`}
                  onClick={() => handleDateClick(date)}
                  className={cn(
                    "min-h-[140px] p-4 border-b border-r border-border text-left transition-colors hover:bg-muted/50 focus:outline-none relative group",
                    !isCurrentMonth && "bg-muted/10 opacity-40",
                    isSelected &&
                      "bg-blue-500/5 ring-1 ring-blue-500/20 ring-inset z-10",
                  )}
                >
                  {/* Date Number */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center w-8 h-8 text-sm font-medium rounded-full transition-all",
                        isToday
                          ? "bg-primary text-primary-foreground"
                          : isCurrentMonth
                            ? "text-foreground"
                            : "text-muted-foreground",
                      )}
                    >
                      {format(date, "d")}
                    </span>
                    {meetings.length > 0 && (
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    )}
                  </div>

                  {/* Events */}
                  <div className="space-y-1">
                    {meetings.slice(0, 2).map((meeting) => (
                      <div
                        key={meeting.id}
                        className={cn(
                          "text-[11px] px-2 py-1 rounded border transition-all truncate",
                          meeting.status === "confirmed"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400 font-medium"
                            : "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400 font-medium",
                        )}
                      >
                        <span className="mr-1.5 opacity-70">
                          {format(new Date(meeting.startTime), "h:mm a")}
                        </span>
                        <span>{meeting.title}</span>
                      </div>
                    ))}
                    {meetings.length > 2 && (
                      <div className="text-[10px] text-muted-foreground px-2 font-medium">
                        + {meetings.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              );
            }),
          )}
        </div>
      </div>

      {/* Vertical Split: Detailed Selected Day Schedule */}
      <TodaysSchedule selectedDate={selectedDate} meetings={allMeetings} />
    </div>
  );
}
