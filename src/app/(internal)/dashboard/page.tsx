import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

import { WelcomeBanner } from "./_components/welcome-banner";
import { NextMeeting } from "./_components/next-meeting";
import { DashboardStats } from "./_components/stats";
import { RecentActivity } from "./_components/recent-activity";
import { UpcomingMeetings } from "./_components/upcoming-meetings";
import { CalendarWidget } from "./_components/calendar-widget";

export default async function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="max-w-7xl mx-auto w-full">
        {/* Welcome Banner - Full Width */}
        <Suspense fallback={<Skeleton className="h-32 mb-8 rounded-xl" />}>
          <WelcomeBanner />
        </Suspense>

        {/* Next Meeting Hero Card - Full Width */}
        <Suspense fallback={<Skeleton className="h-48 mb-8 rounded-xl" />}>
          <NextMeeting />
        </Suspense>

        {/* Stats Cards Grid - Full Width */}
        <Suspense fallback={<Skeleton className="h-32 mb-8" />}>
          <DashboardStats />
        </Suspense>

        {/* Two Column Layout - Recent Activity (Left) & Sidebar (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width on large screens */}
          <div className="lg:col-span-2 space-y-6">
            <Suspense fallback={<Skeleton className="h-96" />}>
              <RecentActivity />
            </Suspense>
          </div>

          {/* Right Column - 1/3 width on large screens */}
          <div className="space-y-6 max-h-[600px] overflow-y-auto">
            {/* Calendar Widget */}
            <CalendarWidget />

            {/* Upcoming Meetings */}
            <Suspense fallback={<Skeleton className="h-64" />}>
              <UpcomingMeetings />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
