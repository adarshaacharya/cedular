import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

import { WelcomeBanner } from "./_components/welcome-banner";
import { NextMeeting } from "./_components/next-meeting";
import { DashboardStats } from "./_components/stats";
import { RecentActivity } from "./_components/recent-activity";
import { UpcomingMeetings } from "./_components/upcoming-meetings";
import { CalendarWidget } from "./_components/calendar-widget";
import { getUserSetupStatus } from "./actions";

async function DashboardContent() {
  const setupStatus = await getUserSetupStatus();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 bg-[radial-gradient(ellipse_at_top_left,rgba(var(--primary-rgb),0.03),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(var(--accent-rgb),0.03),transparent_50%)]">
      <div className="max-w-7xl mx-auto w-full space-y-8">
        <Suspense fallback={<Skeleton className="h-32 mb-8 rounded-2xl" />}>
          <WelcomeBanner />
        </Suspense>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <Suspense fallback={<Skeleton className="h-48 rounded-2xl" />}>
              <NextMeeting />
            </Suspense>

            <Suspense fallback={<Skeleton className="h-32 rounded-2xl" />}>
              <DashboardStats />
            </Suspense>

            <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
              <RecentActivity />
            </Suspense>
          </div>

          <div className="space-y-8">
            <div className="sticky top-6 space-y-8">
              <CalendarWidget setupStatus={setupStatus} />

              <Suspense fallback={<Skeleton className="h-64 rounded-2xl" />}>
                <UpcomingMeetings />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="max-w-7xl mx-auto w-full">
            <Skeleton className="h-32 mb-8 rounded-xl" />
            <Skeleton className="h-48 mb-8 rounded-xl" />
            <Skeleton className="h-32 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-96" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
