import { Suspense } from "react";
import { ThreadsTable } from "./_components/threads-table";
import { getEmailThreads } from "./actions";

export default async function EmailThreadsPage() {
  const threadsPromise = getEmailThreads();

  return (
    <Suspense fallback={<div>Loading email threads...</div>}>
      <ThreadsTable threadsPromise={threadsPromise} />
    </Suspense>
  );
}
