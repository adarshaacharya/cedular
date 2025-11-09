import { Suspense } from "react";
import { getEmailThreads } from "../actions";
import { ThreadsTable } from "./threads-table";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export async function ThreadsList() {
  return (
    <Suspense fallback={<ThreadsListSkeleton />}>
      <ThreadsListContent />
    </Suspense>
  );
}

async function ThreadsListContent() {
  const threads = await getEmailThreads();

  if (threads.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <p>No scheduling requests yet.</p>
        <p className="text-sm mt-2">
          Connect your email to start receiving scheduling requests.
        </p>
      </Card>
    );
  }

  return <ThreadsTable threads={threads} />;
}

function ThreadsListSkeleton() {
  return (
    <Card className="p-8">
      <Skeleton className="h-64 w-full" />
    </Card>
  );
}
