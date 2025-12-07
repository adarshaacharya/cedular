import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ThreadsList } from "@/app/(internal)/email-threads/_components/threads-list";

import { GoogleConnectionCard } from "./_components/google-connection-card";
import { WelcomeBanner } from "./_components/welcome-banner";
import { QuickActions } from "./_components/quick-actions";
import { DashboardStats } from "./_components/stats";

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

        <div className="mb-8">
          <Suspense fallback={<Skeleton className="h-40 w-full mb-8" />}>
            <DashboardStats />
          </Suspense>

          <div className="md:col-span-2 lg:col-span-2">
            <Suspense fallback={<Skeleton className="h-40 w-full" />}>
              <QuickActions />
            </Suspense>
          </div>
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
