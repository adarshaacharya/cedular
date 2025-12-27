import Image from "next/image";
import { Button } from "@/components/ui/button";
import { GreenBlink } from "@/components/atoms/green-blink";
import { connectGoogleServices, disconnectGoogleServices } from "../actions";

const GoogleCalendarIcon = ({ className }: { className?: string }) => (
  <Image
    src="/icons/google-calendar.svg"
    alt="Google Calendar"
    width={32}
    height={32}
    className={className}
  />
);

interface GoogleServicesSectionProps {
  userId: string;
  isConnected: boolean;
  assistantEmail: string | null | undefined;
  calendarId: string | null | undefined;
}

export async function GoogleServicesSection({
  userId,
  isConnected,
  assistantEmail,
  calendarId,
}: GoogleServicesSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {isConnected ? (
          <>
            <GoogleCalendarIcon className="h-8 w-8" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">Connected</p>
                <GreenBlink size="md" />
              </div>
              {assistantEmail && (
                <p className="text-sm text-muted-foreground">
                  Gmail: {assistantEmail}
                </p>
              )}
              {calendarId && (
                <p className="text-sm text-muted-foreground">
                  Calendar: {calendarId}
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <GoogleCalendarIcon className="h-8 w-8 opacity-50" />
            <div className="flex-1">
              <p className="font-medium">Not Connected</p>
              <p className="text-sm text-muted-foreground">
                Connect Google services for email processing and calendar
                scheduling
              </p>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-2">
        {isConnected ? (
          <form action={disconnectGoogleServices}>
            <input type="hidden" name="userId" value={userId} />
            <Button type="submit" variant="outline" size="sm">
              Disconnect Google Services
            </Button>
          </form>
        ) : (
          <form action={connectGoogleServices}>
            <Button type="submit" size="sm">
              Connect Google Services
            </Button>
          </form>
        )}
      </div>

      {isConnected && (
        <div className="rounded-lg bg-muted p-4 text-sm">
          <p className="font-medium mb-1">Connected Services:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>
              <strong>Gmail:</strong> Emails sent to{" "}
              {assistantEmail || "your assistant email"} are automatically
              processed for scheduling requests
            </li>
            <li>
              <strong>Calendar:</strong> AI checks your availability and
              schedules meetings automatically
            </li>
            <li>No double-bookings or scheduling conflicts</li>
          </ul>
        </div>
      )}
    </div>
  );
}
