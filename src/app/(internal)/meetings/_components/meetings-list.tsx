import { Suspense } from "react";
import { getMeetings } from "../actions";
import { MeetingsTable } from "./meetings-table";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function MeetingsListSkeleton() {
  return (
    <Card className="p-8">
      <Skeleton className="h-64 w-full" />
    </Card>
  );
}

async function MeetingsListContent() {
  const meetingsPromise = getMeetings();

  return <MeetingsTable meetingsPromise={meetingsPromise} />;
}

export async function MeetingsList() {
  return (
    <Suspense fallback={<MeetingsListSkeleton />}>
      <MeetingsListContent />
    </Suspense>
  );
}
