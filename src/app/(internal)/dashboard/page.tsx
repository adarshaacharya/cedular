import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ThreadsList } from "@/app/(internal)/email-threads/_components/threads-list";
import { getPendingThreadsCount } from "@/app/(internal)/email-threads/actions";
import { GoogleConnectionCard } from "./_components/google-connection-card";
import { WelcomeBanner } from "./_components/welcome-banner";

export default async function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="max-w-7xl mx-auto w-full">
        <Suspense fallback={<Skeleton className="h-8 w-1/3 mb-8" />}>
          <WelcomeBanner />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-24 mb-6" />}>
          <div className="mb-6">
            <GoogleConnectionCard />
          </div>
        </Suspense>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">
              Meetings This Week
            </div>
            <div className="text-3xl font-bold text-foreground">0</div>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">
              Pending Requests
            </div>
            <Suspense fallback={<Skeleton className="h-9 w-16" />}>
              <PendingCount />
            </Suspense>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">
              Response Time
            </div>
            <div className="text-3xl font-bold text-foreground">—</div>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">
              Success Rate
            </div>
            <div className="text-3xl font-bold text-foreground">—</div>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">
            Recent Scheduling Requests
          </h2>
          <ThreadsList />
        </div>
      </div>
    </div>
  );
}

async function PendingCount() {
  const count = await getPendingThreadsCount();
  return <div className="text-3xl font-bold text-foreground">{count}</div>;
}
