import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { connectCalendar, disconnectCalendar } from "../actions";

interface CalendarConnectionSectionProps {
  userId: string;
  isConnected: boolean;
  calendarId: string | null | undefined;
}

export async function CalendarConnectionSection({
  userId,
  isConnected,
  calendarId,
}: CalendarConnectionSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {isConnected ? (
          <>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div className="flex-1">
              <p className="font-medium">Connected</p>
              {calendarId && (
                <p className="text-sm text-muted-foreground">{calendarId}</p>
              )}
            </div>
          </>
        ) : (
          <>
            <XCircle className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">Not Connected</p>
              <p className="text-sm text-muted-foreground">
                Connect Google Calendar to check availability
              </p>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-2">
        {isConnected ? (
          <form action={disconnectCalendar}>
            <input type="hidden" name="userId" value={userId} />
            <Button type="submit" variant="outline" size="sm">
              Disconnect Calendar
            </Button>
          </form>
        ) : (
          <form action={connectCalendar.bind(null, userId)}>
            <Button type="submit" size="sm">
              Connect Calendar
            </Button>
          </form>
        )}
      </div>

      {isConnected && (
        <div className="rounded-lg bg-muted p-4 text-sm">
          <p className="font-medium mb-1">Calendar Access:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>AI checks your calendar for available time slots</li>
            <li>Meetings are automatically scheduled</li>
            <li>No double-bookings or conflicts</li>
          </ul>
        </div>
      )}
    </div>
  );
}
