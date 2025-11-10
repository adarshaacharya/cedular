import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ThreadsList } from "@/app/(internal)/email-threads/_components/threads-list";
import { getPendingThreadsCount } from "@/app/(internal)/email-threads/actions";
import { getGoogleConnectionStatus } from "./actions";
import { GoogleConnectionCard } from "./_components/google-connection-card";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const googleStatus = await getGoogleConnectionStatus();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome back,{" "}
            {session?.user?.name || session?.user?.email || "User"}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your scheduling.
          </p>
        </div>

        {/* Google Connection Card */}
        {!googleStatus.connected && (
          <div className="mb-6">
            <GoogleConnectionCard
              connected={googleStatus.connected}
              email={googleStatus.email}
            />
          </div>
        )}

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
