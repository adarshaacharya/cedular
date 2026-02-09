import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getEmailThreadById } from "../actions";
import { EmailThreadDetail } from "./_components/email-thread-detail";
import { Skeleton } from "@/components/ui/skeleton";

interface EmailThreadPageProps {
  params: Promise<{ id: string }>;
}

function EmailThreadDetailSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="w-full">
        {/* Header (matches EmailThreadDetail) */}
        <div className="mb-6">
          <div className="mb-4">
            <Skeleton className="h-8 w-56" />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Skeleton className="h-9 w-[min(720px,80%)]" />
              <Skeleton className="h-4 w-72 mt-2" />
            </div>
            <Skeleton className="h-7 w-28 shrink-0" />
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex gap-8">
          {/* Left: Email Conversation */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-64" />
            </div>

            <div className="space-y-0">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="relative">
                  {/* Timeline connector */}
                  {idx !== 2 && (
                    <div className="absolute left-6 top-12 bottom-0 w-px bg-border" />
                  )}

                  <div className="flex gap-4 pb-6">
                    {/* Avatar */}
                    <div className="flex flex-col items-center gap-2">
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </div>

                    {/* Email content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3 gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-2 mb-1">
                            <Skeleton className="h-5 w-56" />
                            <Skeleton className="h-3 w-28" />
                          </div>
                          <div className="flex flex-wrap gap-4">
                            <Skeleton className="h-3 w-72" />
                            <Skeleton className="h-3 w-40" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-10 shrink-0" />
                      </div>

                      <div className="rounded-lg p-4 border bg-muted/30">
                        <Skeleton className="h-4 w-[92%]" />
                        <Skeleton className="h-4 w-[86%] mt-2" />
                        <Skeleton className="h-4 w-[78%] mt-2" />
                        <Skeleton className="h-4 w-[66%] mt-2" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="w-80 shrink-0 space-y-6">
            {Array.from({ length: 4 }).map((_, sectionIdx) => (
              <div key={sectionIdx} className="space-y-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-6 w-40" />
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-6 w-28" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-6 w-40" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

async function EmailThreadContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const thread = await getEmailThreadById(id);

  if (!thread) {
    notFound();
  }

  return <EmailThreadDetail thread={thread} />;
}

export default async function EmailThreadPage({
  params,
}: EmailThreadPageProps) {

  return (
    <Suspense fallback={<EmailThreadDetailSkeleton />}>
      <EmailThreadContent params={params} />
    </Suspense>
  );
}
