import { Skeleton } from "@/components/ui/skeleton";
import { FullCalendarView } from "./_components/full-calendar-view";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-background bg-[radial-gradient(ellipse_at_top_left,rgba(var(--primary-rgb),0.03),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(var(--accent-rgb),0.03),transparent_50%)]">
      <div className="container mx-auto px-4 py-8 lg:px-8 xl:px-12 max-w-7xl space-y-8">
        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="space-y-1">
              <Badge variant="outline" className="font-tech text-[10px] tracking-[0.2em] px-3 py-1 border-primary/20 text-primary/70 bg-primary/5 uppercase">
                Temporal Grid
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-tech font-bold tracking-tight text-foreground leading-tight">
                Calendar
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed font-medium">
                Synchronize and manage your mission schedule across the temporal grid.
              </p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-8 shadow-xl">
          <Suspense fallback={
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
          }>
            <FullCalendarView />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
