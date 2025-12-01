import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getEmailThreadById } from "../actions";
import { EmailThreadDetail } from "./_components/email-thread-detail";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface EmailThreadPageProps {
  params: Promise<{ id: string }>;
}

function EmailThreadDetailSkeleton() {
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

async function EmailThreadContent({ id }: { id: string }) {
  const thread = await getEmailThreadById(id);

  if (!thread) {
    notFound();
  }

  return <EmailThreadDetail thread={thread} />;
}

export default async function EmailThreadPage({
  params,
}: EmailThreadPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<EmailThreadDetailSkeleton />}>
      <EmailThreadContent id={id} />
    </Suspense>
  );
}
