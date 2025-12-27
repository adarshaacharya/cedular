import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

import { WelcomeBanner } from "./_components/welcome-banner";
import { DashboardStats } from "./_components/stats";
import { RecentActivity } from "./_components/recent-activity";
import { UpcomingMeetings } from "./_components/upcoming-meetings";

export default async function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="max-w-7xl mx-auto w-full">
        <Suspense fallback={<Skeleton className="h-16 mb-8" />}>
          <WelcomeBanner />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-32 mb-8" />}>
          <DashboardStats />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-64 mb-8" />}>
          <RecentActivity />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-48" />}>
          <UpcomingMeetings />
        </Suspense>
      </div>
    </div>
  );
}
