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

interface EmailThreadsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function ThreadsTableContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const threadsPromise = getEmailThreads(resolvedSearchParams);

  return <ThreadsTable threadsPromise={threadsPromise} />;
}

export default async function EmailThreadsPage({
  searchParams,
}: EmailThreadsPageProps) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-6 bg-[radial-gradient(ellipse_at_top_right,rgba(var(--primary-rgb),0.03),transparent_50%)]">
      <div className="mx-auto w-full max-w-screen-2xl space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-tech font-bold tracking-widest uppercase">
              Communication Hub
            </div>
            <h1 className="text-4xl font-tech font-bold tracking-tight">Email Threads</h1>
            <p className="text-muted-foreground text-lg max-w-xl font-medium">
              Manage your AI-coordinated conversations and scheduling sessions.
            </p>
          </div>

          <div className="flex gap-3">
            {/* Optional: Add action buttons here */}
          </div>
        </div>

        <Suspense fallback={<EmailThreadsStatsSkeleton />}>
          <EmailThreadsStats />
        </Suspense>

        <div className="relative">
          <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent rounded-3xl -m-4 pointer-events-none" />
          <Suspense fallback={<ThreadsTableSkeleton />}>
            <ThreadsTableContent searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
