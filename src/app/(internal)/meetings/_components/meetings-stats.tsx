import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import { Suspense } from "react";
import { getMeetingsCount } from "../actions";

function StatsCardSkeleton() {
  return (
    <Card className="p-6">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-9 w-12" />
    </Card>
  );
}

async function StatsContent() {
  const counts = await getMeetingsCount();

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <Calendar className="h-4 w-4" />
          Total Meetings
        </div>
        <div className="text-3xl font-bold text-foreground">{counts.total}</div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <CheckCircle className="h-4 w-4 text-green-500" />
          Confirmed
        </div>
        <div className="text-3xl font-bold text-green-600">
          {counts.confirmed}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <Clock className="h-4 w-4 text-yellow-500" />
          Proposed
        </div>
        <div className="text-3xl font-bold text-yellow-600">
          {counts.proposed}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <XCircle className="h-4 w-4 text-red-500" />
          Cancelled
        </div>
        <div className="text-3xl font-bold text-red-600">
          {counts.cancelled}
        </div>
      </Card>
    </>
  );
}

export function MeetingsStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <Suspense
        fallback={
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        }
      >
        <StatsContent />
      </Suspense>
    </div>
  );
}
