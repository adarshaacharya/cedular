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

      {/* Setup Notice */}
      {!scheduleProfile && (
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 p-4">
          <div className="flex">
            <div className="shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Set up your scheduling preferences
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p>
                  Configure your timezone and working hours to get personalized
                  meeting suggestions and ensure your calendar reflects your
                  actual availability.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timezone */}
      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone</Label>
        <select
          id="timezone"
          name="timezone"
          defaultValue={scheduleProfile?.timezone}
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
          defaultValue={scheduleProfile?.workingHoursStart}
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
          defaultValue={scheduleProfile?.workingHoursEnd}
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
          defaultValue={scheduleProfile?.bufferMinutes}
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
