import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Clock, Cog, Calendar, XCircle } from "lucide-react";
import { Suspense } from "react";

function StatsCardSkeleton() {
  return (
    <Card className="p-6">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-9 w-12" />
    </Card>
  );
}

async function StatsContent() {
  const stats = await getEmailThreadsStats();

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <Mail className="h-4 w-4" />
          Total Threads
        </div>
        <div className="text-3xl font-bold text-foreground">{stats.total}</div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <Clock className="h-4 w-4 text-yellow-500" />
          Pending
        </div>
        <div className="text-3xl font-bold text-yellow-600">
          {stats.pending}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <Cog className="h-4 w-4 text-blue-500" />
          Processing
        </div>
        <div className="text-3xl font-bold text-blue-600">
          {stats.processing}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <Calendar className="h-4 w-4 text-green-500" />
          Scheduled
        </div>
        <div className="text-3xl font-bold text-green-600">
          {stats.scheduled}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <XCircle className="h-4 w-4 text-red-500" />
          Failed
        </div>
        <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
      </Card>
    </>
  );
}

export function ThreadsStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
      <Suspense
        fallback={
          <>
            <StatsCardSkeleton />
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
