import { Suspense } from "react";
import { getMeetings } from "../actions";
import { MeetingsTable } from "./meetings-table";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

interface MeetingsListProps {
  searchParams: SearchParams;
}

function MeetingsListSkeleton() {
  return (
    <Card className="p-8">
      <Skeleton className="h-64 w-full" />
    </Card>
  );
}

async function MeetingsListContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const meetingsPromise = getMeetings(resolvedSearchParams);

  return <MeetingsTable meetingsPromise={meetingsPromise} />;
}

export async function MeetingsList({ searchParams }: MeetingsListProps) {
  return (
    <Suspense fallback={<MeetingsListSkeleton />}>
      <MeetingsListContent searchParams={searchParams} />
    </Suspense>
  );
}
