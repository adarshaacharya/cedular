import { MeetingsList } from "./_components/meetings-list";
import { MeetingsStats } from "./_components/meetings-stats";

interface MeetingsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function MeetingsPage({ searchParams }: MeetingsPageProps) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-6 bg-[radial-gradient(ellipse_at_bottom_left,rgba(var(--primary-rgb),0.03),transparent_50%)]">
      <div className="mx-auto w-full max-w-screen-2xl space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-tech font-bold tracking-widest uppercase">
              Mission Control
            </div>
            <h1 className="text-4xl font-tech font-bold tracking-tight">Meetings</h1>
            <p className="text-muted-foreground text-lg max-w-xl font-medium">
              Your confirmed schedule and upcoming sessions across all platforms.
            </p>
          </div>
        </div>

        <MeetingsStats />

        <div className="relative">
          <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent rounded-3xl -m-4 pointer-events-none" />
          <MeetingsList searchParams={searchParams} />
        </div>
      </div>
    </div>
  );
}
