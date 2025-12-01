import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getMeetingById } from "../actions";
import { MeetingDetail } from "./_components/meeting-detail";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface MeetingPageProps {
  params: Promise<{ id: string }>;
}

function MeetingDetailSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="max-w-4xl mx-auto w-full">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-32 mb-8" />
        <Card className="p-8">
          <Skeleton className="h-64 w-full" />
        </Card>
      </div>
    </div>
  );
}

async function MeetingContent({ id }: { id: string }) {
  const meeting = await getMeetingById(id);

  if (!meeting) {
    notFound();
  }

  return <MeetingDetail meeting={meeting} />;
}

export default async function MeetingPage({ params }: MeetingPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<MeetingDetailSkeleton />}>
      <MeetingContent id={id} />
    </Suspense>
  );
}
