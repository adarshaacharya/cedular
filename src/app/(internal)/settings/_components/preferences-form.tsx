"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUserPreferences } from "../actions";
import { useTransition, useState } from "react";
import { getTimeZones } from "@vvo/tzdb";

interface PreferencesFormProps {
  userId: string;
  preferences: {
    calendarId: string | null;
    assistantEmail: string | null;
  } | null;
  scheduleProfile: {
    timezone: string;
    workingHoursStart: string;
    workingHoursEnd: string;
    bufferMinutes: number;
  } | null;
}

// Get all timezones and format them for display
const getAllTimezones = () => {
  const tzdb = getTimeZones();

  return tzdb
    .map((tz) => ({
      value: tz.name,
      label: `${tz.name.replace(/_/g, " ")} (${tz.mainCities.join(", ")})`,
      group: tz.group,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

export function PreferencesForm({
  userId,
  preferences,
  scheduleProfile,
}: PreferencesFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setMessage(null);
    startTransition(async () => {
      try {
        await updateUserPreferences(formData);
        setMessage({
          type: "success",
          text: "Preferences updated successfully!",
        });
      } catch (error) {
        setMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Failed to update preferences",
        });
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      <input type="hidden" name="userId" value={userId} />

      {/* Timezone */}
      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone</Label>
        <select
          id="timezone"
          name="timezone"
          defaultValue={scheduleProfile?.timezone || "UTC"}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {getAllTimezones().map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
        <p className="text-sm text-muted-foreground">
          Your timezone for scheduling meetings (includes all world timezones)
        </p>
      </div>

      {/* Working Hours Start */}
      <div className="space-y-2">
        <Label htmlFor="workingHoursStart">Working Hours Start</Label>
        <Input
          id="workingHoursStart"
          name="workingHoursStart"
          type="time"
          defaultValue={scheduleProfile?.workingHoursStart || "09:00"}
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
          defaultValue={scheduleProfile?.workingHoursEnd || "17:00"}
          className="w-full"
        />
        <p className="text-sm text-muted-foreground">
          When your workday typically ends
        </p>
      </div>

      {/* Buffer Minutes */}
      <div className="space-y-2">
        <Label htmlFor="bufferMinutes">Buffer Between Meetings (minutes)</Label>
        <Input
          id="bufferMinutes"
          name="bufferMinutes"
          type="number"
          min="0"
          max="120"
          step="5"
          defaultValue={scheduleProfile?.bufferMinutes || 15}
          className="w-full"
        />
        <p className="text-sm text-muted-foreground">
          Time buffer added before and after each meeting to avoid back-to-back
          scheduling
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
          The calendar to check for availability (usually &quot;primary&quot;)
        </p>
      </div>

      {/* Assistant Email */}
      <div className="space-y-2">
        <Label htmlFor="assistantEmail">Assistant Email (Optional)</Label>
        <Input
          id="assistantEmail"
          name="assistantEmail"
          type="email"
          placeholder="assistant@yourdomain.com"
          defaultValue={preferences?.assistantEmail || ""}
          className="w-full"
        />
        <p className="text-sm text-muted-foreground">
          The email address your AI assistant uses when sending scheduling
          responses
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`rounded-lg p-4 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </form>
  );
}
