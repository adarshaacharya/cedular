import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ThreadsTable } from "./_components/threads-table";
import { ThreadsTableSkeleton } from "./_components/threads-table-skeleton";
import { EmailThreadsStats } from "./_components/email-threads-stats";
import { getEmailThreads } from "./actions";
import type { Metadata } from "next";

function EmailThreadsStatsSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <Card className="p-6" key={idx}>
          <Skeleton className="h-4 w-32 mb-3" />
          <Skeleton className="h-10 w-20" />
        </Card>
      ))}
    </div>
  );
}

export const metadata: Metadata = {
  title: "Email Threads | Cedular",
  description: "View and manage your email threads and conversations",
};

export default async function EmailThreadsPage() {
  const threadsPromise = getEmailThreads();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="mx-auto w-full max-w-screen-2xl space-y-6">
        <div className="flex flex-col gap-6 w-full">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Email Threads</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your email threads and conversations
            </p>
          </div>

          <div className="w-full">
            <Suspense fallback={<EmailThreadsStatsSkeleton />}>
              <EmailThreadsStats />
            </Suspense>
          </div>
        </div>

        <div className="w-full">
          <div className="mt-6">
            <Suspense fallback={<ThreadsTableSkeleton />}>
              <ThreadsTable threadsPromise={threadsPromise} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
