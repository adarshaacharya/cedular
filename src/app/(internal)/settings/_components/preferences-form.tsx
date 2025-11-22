import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUserPreferences } from "../actions";

interface PreferencesFormProps {
  userId: string;
  preferences: {
    timezone: string;
    calendarId: string | null;
  } | null;
}

const timezones = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "UTC",
];

export async function PreferencesForm({
  userId,
  preferences,
}: PreferencesFormProps) {
  return (
    <form action={updateUserPreferences} className="space-y-6">
      <input type="hidden" name="userId" value={userId} />

      {/* Timezone */}
      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone</Label>
        <select
          id="timezone"
          name="timezone"
          defaultValue={preferences?.timezone || "UTC"}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {timezones.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
        <p className="text-sm text-muted-foreground">
          Your timezone for scheduling meetings
        </p>
      </div>

      {/* Working Hours Start */}
      <div className="space-y-2">
        <Label htmlFor="workingHoursStart">Working Hours Start</Label>
        <Input
          id="workingHoursStart"
          name="workingHoursStart"
          type="time"
          defaultValue="09:00"
          className="w-full"
        />
        <p className="text-sm text-muted-foreground">
          When your workday typically starts
        </p>
      </div>

      {/* Working Hours End */}
      <div className="space-y-2">
        <Label htmlFor="workingHoursEnd">Working Hours End</Label>
        <Input
          id="workingHoursEnd"
          name="workingHoursEnd"
          type="time"
          defaultValue="17:00"
          className="w-full"
        />
        <p className="text-sm text-muted-foreground">
          When your workday typically ends
        </p>
      </div>

      {/* Calendar ID */}
      <div className="space-y-2">
        <Label htmlFor="calendarId">Primary Calendar ID</Label>
        <Input
          id="calendarId"
          name="calendarId"
          type="text"
          placeholder="primary or your-email@gmail.com"
          defaultValue={preferences?.calendarId || ""}
          className="w-full"
        />
        <p className="text-sm text-muted-foreground">
          The calendar to check for availability (usually "primary")
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit">Save Preferences</Button>
      </div>
    </form>
  );
}
