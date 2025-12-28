"use client";

import * as React from "react";
import { formatDateRange } from "little-date";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export interface CalendarEvent {
  id: string;
  title: string;
  from: string | Date;
  to: string | Date;
  type?: "meeting" | "calendar" | "email" | "task";
  description?: string;
}

export interface CalendarWithEventSlotsProps {
  events: CalendarEvent[];
  selectedDate?: Date;
  onDateSelect?: (date: Date | undefined) => void;
  onAddEvent?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  defaultDate?: Date;
  className?: string;
  showAddButton?: boolean;
  maxEventsDisplayed?: number;
}

export function CalendarWithEventSlots({
  events,
  selectedDate,
  onDateSelect,
  onAddEvent,
  onEventClick,
  defaultDate = new Date(),
  className = "w-fit py-4",
  showAddButton = true,
  maxEventsDisplayed = 10,
}: CalendarWithEventSlotsProps) {
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(
    defaultDate
  );

  // Use external date if provided, otherwise use internal state
  const date = selectedDate !== undefined ? selectedDate : internalDate;

  const handleDateSelect = (newDate: Date | undefined) => {
    if (onDateSelect) {
      onDateSelect(newDate);
    } else {
      setInternalDate(newDate);
    }
  };

  const handleAddEvent = () => {
    if (onAddEvent && date) {
      onAddEvent(date);
    }
  };

  // Filter events for the selected date
  const selectedDateEvents = React.useMemo(() => {
    if (!date) return [];

    const selectedDateString = date.toDateString();
    return events
      .filter((event) => {
        const eventDate = new Date(event.from).toDateString();
        return eventDate === selectedDateString;
      })
      .sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime())
      .slice(0, maxEventsDisplayed);
  }, [events, date, maxEventsDisplayed]);

  return (
    <Card className={className}>
      <CardContent className="px-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          className="bg-transparent p-0"
          required
        />
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 border-t px-4 !pt-4">
        <div className="flex w-full items-center justify-between px-1">
          <div className="text-sm font-medium">
            {date?.toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
          {showAddButton && (
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              title="Add Event"
              onClick={handleAddEvent}
            >
              <PlusIcon />
              <span className="sr-only">Add Event</span>
            </Button>
          )}
        </div>
        <div className="flex w-full flex-col gap-2">
          {selectedDateEvents.length === 0 ? (
            <div className="text-muted-foreground text-sm py-4 text-center">
              No events scheduled for this date
            </div>
          ) : (
            selectedDateEvents.map((event) => (
              <div
                key={event.id}
                className="bg-muted hover:bg-muted/80 after:bg-primary/70 relative cursor-pointer rounded-md p-2 pl-6 text-sm after:absolute after:inset-y-2 after:left-2 after:w-1 after:rounded-full transition-colors"
                onClick={() => onEventClick?.(event)}
              >
                <div className="font-medium">{event.title}</div>
                <div className="text-muted-foreground text-xs">
                  {formatDateRange(new Date(event.from), new Date(event.to))}
                </div>
                {event.description && (
                  <div className="text-muted-foreground text-xs mt-1 truncate">
                    {event.description}
                  </div>
                )}
              </div>
            ))
          )}
          {selectedDateEvents.length >= maxEventsDisplayed && (
            <div className="text-muted-foreground text-xs text-center">
              And{" "}
              {events.filter(
                (event) =>
                  new Date(event.from).toDateString() === date?.toDateString()
              ).length - maxEventsDisplayed}{" "}
              more events...
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
