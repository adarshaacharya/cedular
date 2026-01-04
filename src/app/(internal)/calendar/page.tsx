import { Skeleton } from "@/components/ui/skeleton";
import { FullCalendarView } from "./_components/full-calendar-view";
import { Suspense } from "react";

export default function CalendarPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your meetings in a calendar format
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <Suspense fallback={<Skeleton className="h-full w-full" />}>
            <FullCalendarView />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
