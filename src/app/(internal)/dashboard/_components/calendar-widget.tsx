"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, Users, Video, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { getMeetingDatesForMonth, getMeetingsForDate } from "../actions";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { AlertCircle } from "lucide-react";
import { type SetupStep } from "../constants";

interface CalendarWidgetProps {
  setupStatus?: {
    completionPercentage: number;
    missingSteps: SetupStep[];
  };
}

export function CalendarWidget({ setupStatus }: CalendarWidgetProps = {}) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    new Date()
  );
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  const { data: meetingDates = [] } = useSWR(
    `meeting-dates-${currentMonth.getFullYear()}-${currentMonth.getMonth()}`,
    () =>
      getMeetingDatesForMonth(
        currentMonth.getFullYear(),
        currentMonth.getMonth()
      )
  );

  const {
    data: meetingsForDate = [],
    error: meetingsError,
    isLoading: isMeetingsLoading,
  } = useSWR(
    selectedDate
      ? `meetings-${selectedDate.toISOString().split("T")[0]}`
      : null,
    () =>
      selectedDate ? getMeetingsForDate(selectedDate) : Promise.resolve([])
  );

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (!date) {
      setIsPopoverOpen(false);
      return;
    }
    setIsPopoverOpen(true);
  };

  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month);
  };

  const modifiers = React.useMemo(() => {
    const datesWithMeetings = meetingDates.map((dateStr: string) => {
      const [year, month, day] = dateStr.split("-").map(Number);
      return new Date(year, month - 1, day);
    });
    return {
      hasMeetings: datesWithMeetings,
    };
  }, [meetingDates]);

  const modifiersClassNames = {
    hasMeetings:
      "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-primary after:shadow-[0_0_8px_rgba(var(--primary-rgb),0.6)]",
  };

  return (
    <Card className="border-none bg-card/50 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden">
      <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
        <CalendarIcon className="h-24 w-24 -mr-8 -mt-8 rotate-12" />
      </div>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-tech tracking-tight">Calendar</CardTitle>
            <CardDescription className="text-[10px] font-tech uppercase tracking-widest text-muted-foreground/60 mt-1">
              Mission Schedule
            </CardDescription>
          </div>
          <div className="h-8 w-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center">
            <CalendarIcon className="h-4 w-4 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Setup Warning */}
        {setupStatus && setupStatus.completionPercentage < 100 && (
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mb-6 ring-1 ring-primary/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-foreground font-bold font-tech tracking-tight uppercase">
                  Node Offline
                </p>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium leading-relaxed">
                  Complete setup to synchronize your primary calendar node.
                </p>
              </div>
            </div>
          </div>
        )}

        <Popover
          open={isPopoverOpen && meetingsForDate.length > 0}
          onOpenChange={setIsPopoverOpen}
        >
          <PopoverTrigger asChild>
            <div className="w-full">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                month={currentMonth}
                onMonthChange={handleMonthChange}
                modifiers={modifiers}
                modifiersClassNames={modifiersClassNames}
                className="rounded-xl border-border/40 w-full bg-background/40 font-tech"
                classNames={{
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]",
                  day_today: "bg-muted text-foreground font-bold",
                }}
              />
            </div>
          </PopoverTrigger>
          {meetingsForDate.length > 0 && (
            <PopoverContent
              className="w-80 p-0 border-border/40 bg-card/90 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden"
              side="left"
              align="start"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    <h4 className="font-tech text-xs font-bold tracking-widest uppercase">
                      {selectedDate ? format(selectedDate, "MMM d, yyyy") : ""}
                    </h4>
                  </div>
                  <Badge variant="outline" className="font-tech text-[8px] tracking-widest px-1.5 py-0 border-primary/20 text-primary/60">
                    {meetingsForDate.length} SESSIONS
                  </Badge>
                </div>

                {isMeetingsLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-[10px] font-tech text-muted-foreground tracking-widest">
                      SCANNING...
                    </p>
                  </div>
                ) : meetingsError ? (
                  <div className="text-center py-4">
                    <p className="text-[10px] font-tech text-destructive tracking-widest">
                      LINK FAILED
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {meetingsForDate.map((meeting) => (
                      <div
                        key={meeting.id}
                        className="p-3 border border-border/40 rounded-xl bg-background/40 hover:bg-background hover:border-primary/30 transition-all group/item"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm line-clamp-1 group-hover/item:text-primary transition-colors">
                              {meeting.title}
                            </p>
                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1 font-medium">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-primary/60" />
                                <span>
                                  {format(meeting.startTime, "h:mm a")}
                                </span>
                              </div>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3 text-primary/60" />
                                <span>
                                  {meeting.participants}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "shrink-0 font-tech text-[8px] tracking-tighter px-1.5 py-0",
                              meeting.status === "confirmed"
                                ? "border-green-500/30 text-green-500 bg-green-500/5"
                                : "border-primary/30 text-primary bg-primary/5"
                            )}
                          >
                            {meeting.status.toUpperCase()}
                          </Badge>
                        </div>

                        {meeting.meetingLink && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2 h-7 text-[9px] font-tech tracking-widest border-border/60 hover:bg-primary hover:text-primary-foreground transition-all"
                            asChild
                          >
                            <a
                              href={meeting.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2"
                            >
                              <Video className="h-3 w-3" />
                              JOIN SESSION
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          )}
        </Popover>
        <div className="mt-4 text-[10px] font-tech text-muted-foreground/40 text-center tracking-widest uppercase">
          • ACTIVE NODES MARKED
        </div>
      </CardContent>
    </Card>
  );
}
