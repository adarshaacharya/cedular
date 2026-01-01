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
      "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-emerald-500",
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Calendar
        </CardTitle>
        <CardDescription>
          Click on dates with meetings to view details
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Setup Warning */}
        {setupStatus && setupStatus.completionPercentage < 100 && (
          <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">
                  Complete setup to see your meetings
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Connect Google and set preferences to sync your calendar.
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
                className="rounded-md border w-full"
              />
            </div>
          </PopoverTrigger>
          {meetingsForDate.length > 0 && (
            <PopoverContent
              className="w-80 p-0"
              side="right"
              align="start"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-semibold">
                    {selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}
                  </h4>
                </div>

                {isMeetingsLoading ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      Loading meetings...
                    </p>
                  </div>
                ) : meetingsError ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-red-500">
                      Failed to load meetings
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {meetingsForDate.map((meeting) => (
                      <div
                        key={meeting.id}
                        className="p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-1">
                              {meeting.title}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {format(meeting.startTime, "h:mm a")}
                                </span>
                              </div>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>
                                  {meeting.participants} participant
                                  {meeting.participants !== 1 ? "s" : ""}
                                </span>
                              </div>
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
                )}
              </div>
            </PopoverContent>
          )}
        </Popover>
        <div className="mt-2 text-xs text-muted-foreground text-center">
          • Dates with meetings are marked with green dots
        </div>
      </CardContent>
    </Card>
  );
}
