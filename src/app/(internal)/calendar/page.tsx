import { Skeleton } from "@/components/ui/skeleton";
import { FullCalendarView } from "./_components/full-calendar-view";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative Atmosphere - Matching Dashboard */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
        <svg className="h-full w-full">
          <defs>
            <pattern
              id="calendar-grid"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 32 0 L 0 0 0 32"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#calendar-grid)" />
        </svg>
      </div>

      <div className="relative z-10 w-full px-4 py-8 lg:px-12 xl:px-16 space-y-8">
        <div className="relative max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="space-y-1">
              <Badge
                variant="outline"
                className="font-tech text-xs tracking-[0.2em] px-3 py-1 border-primary/20 text-primary bg-primary/5 uppercase"
              >
                Temporal Grid
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-tech font-bold tracking-tight text-foreground leading-tight">
                Calendar
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed font-medium">
                Synchronize and manage your mission schedule across the temporal
                grid.
              </p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border/5 bg-card/20 backdrop-blur-md p-6 lg:p-10 shadow-3xl transition-all duration-500">
          <Suspense
            fallback={
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-8">
                  <Skeleton className="h-10 w-48" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-10" />
                  </div>
                </div>
                <Skeleton className="h-[600px] w-full rounded-xl" />
              </div>
            }
          >
            <FullCalendarView />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
