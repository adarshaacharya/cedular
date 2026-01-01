import { Suspense } from "react";
import { ThreadsTable } from "./_components/threads-table";
import { ThreadsTableSkeleton } from "./_components/threads-table-skeleton";
import { getEmailThreads } from "./actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Threads | Cedular",
  description: "View and manage your email threads and conversations",
};

export default async function EmailThreadsPage() {
  const threadsPromise = getEmailThreads();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Email Threads</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your email threads and conversations
          </p>
        </div>

        <div className="mt-6">
          <Suspense fallback={<ThreadsTableSkeleton />}>
            <ThreadsTable threadsPromise={threadsPromise} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
