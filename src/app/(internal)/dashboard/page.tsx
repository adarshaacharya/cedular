import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

import { WelcomeBanner } from "./_components/welcome-banner";
import { NextMeeting } from "./_components/next-meeting";
import { DashboardStats } from "./_components/stats";
import { RecentActivity } from "./_components/recent-activity";
import { UpcomingMeetings } from "./_components/upcoming-meetings";
import { CalendarWidget } from "./_components/calendar-widget";
import { getUserSetupStatus } from "./actions";
import { motion } from "framer-motion";

async function DashboardContent() {
  const setupStatus = await getUserSetupStatus();

  // Predefined meteor properties to avoid Math.random() during render
  const meteorProps = [
    { height: "35px", left: "15%", duration: 4.2, delay: 0.5 },
    { height: "28px", left: "45%", duration: 3.8, delay: 1.2 },
    { height: "42px", left: "72%", duration: 4.5, delay: 2.1 },
    { height: "31px", left: "28%", duration: 3.6, delay: 3.4 },
    { height: "39px", left: "58%", duration: 4.1, delay: 0.8 },
    { height: "25px", left: "85%", duration: 3.9, delay: 2.8 },
    { height: "36px", left: "32%", duration: 4.3, delay: 1.7 },
    { height: "33px", left: "68%", duration: 3.7, delay: 4.1 },
  ];

  return (
    <div className="relative flex flex-1 flex-col gap-6 p-6 overflow-hidden">
      {/* Atmosphere Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] dark:opacity-[0.05]">
          <svg className="h-full w-full">
            <defs>
              <pattern
                id="dash-grid"
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
            <rect width="100%" height="100%" fill="url(#dash-grid)" />
          </svg>
        </div>

        {/* Falling meteor shower animation */}
        <div className="absolute inset-0 overflow-hidden">
          {meteorProps.map((meteor, i) => (
            <div
              key={i}
              className="absolute w-px bg-linear-to-b from-transparent via-primary/20 to-transparent animate-meteor"
              style={{
                height: meteor.height,
                left: meteor.left,
                top: `-100px`,
                animationDuration: `${meteor.duration}s`,
                animationDelay: `${meteor.delay}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full space-y-8">
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
