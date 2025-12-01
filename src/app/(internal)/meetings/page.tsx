import { MeetingsList } from "./_components/meetings-list";
import { MeetingsStats } from "./_components/meetings-stats";

export default function MeetingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Meetings</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all your scheduled meetings
          </p>
        </div>

        <MeetingsStats />

        <div className="mt-6">
          <MeetingsList />
        </div>
      </div>
    </div>
  );
}
