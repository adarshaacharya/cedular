import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getMeetingById } from "../actions";
import { MeetingDetail } from "./_components/meeting-detail";
import { Skeleton } from "@/components/ui/skeleton";

interface MeetingPageProps {
  params: Promise<{ id: string }>;
}

function MeetingDetailSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8 lg:px-8 xl:px-12 max-w-7xl">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-10 w-32" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-12 w-96" />
          <Skeleton className="h-6 w-64 mt-4" />
        </div>

        {/* Main content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <Skeleton className="h-6 w-24 mb-4" />
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-5 w-40 mb-3" />
                <Skeleton className="h-4 w-36" />
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <Skeleton className="h-6 w-28 mb-4" />
                <Skeleton className="h-6 w-16 ml-auto mb-4" />
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <Skeleton className="h-6 w-32 mb-6" />
              <div className="space-y-6">
                <div className="flex gap-4">
                  <Skeleton className="w-4 h-4 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Skeleton className="w-4 h-4 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-24 mb-2" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Skeleton className="w-4 h-4 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-28 mb-2" />
                    <Skeleton className="h-4 w-52" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <Skeleton className="h-6 w-28 mb-4" />
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-5 w-24 mb-3" />
              <Skeleton className="h-8 w-full" />
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-6 w-16 mb-2" />
              <Skeleton className="h-4 w-40 mb-3" />
              <Skeleton className="h-6 w-full" />
            </div>
          </div>
        </div>
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
