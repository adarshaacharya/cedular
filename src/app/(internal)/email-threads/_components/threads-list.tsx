import { Suspense } from "react";
import { getEmailThreads } from "../actions";
import { ThreadsTable } from "./threads-table";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ThreadsListSkeleton() {
  return (
    <Card className="p-8">
      <Skeleton className="h-64 w-full" />
    </Card>
  );
}

async function ThreadsListContent() {
  const threadsPromise = getEmailThreads();

  return <ThreadsTable threadsPromise={threadsPromise} />;
}

export async function ThreadsList() {
  return (
    <Suspense fallback={<ThreadsListSkeleton />}>
      <ThreadsListContent />
    </Suspense>
  );
}
