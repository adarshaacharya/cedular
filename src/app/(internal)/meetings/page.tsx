import { MeetingsList } from "./_components/meetings-list";
import { MeetingsStats } from "./_components/meetings-stats";

export default function MeetingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="mx-auto w-full max-w-screen-2xl space-y-6">
        <div className="flex flex-col gap-6 w-full">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Meetings</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all your scheduled meetings
            </p>
          </div>

          <div className="w-full">
            <MeetingsStats />
          </div>
        </div>

        <div className="w-full">
          <div className="mt-6">
            <MeetingsList />
          </div>
        </div>
      </div>
    </div>
  );
}
