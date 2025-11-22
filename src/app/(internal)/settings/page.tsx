import { Suspense } from "react";
import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GmailConnectionSection } from "./_components/gmail-connection-section";
import { CalendarConnectionSection } from "./_components/calendar-connection-section";
import { PreferencesForm } from "./_components/preferences-form";

async function getUserPreferences(userId: string) {
  const preferences = await prisma.userPreferences.findUnique({
    where: { userId },
  });

  return preferences;
}

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const userPreferences = await getUserPreferences(session.user.id);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account preferences and integrations
          </p>
        </div>

        {/* Gmail Connection */}
        <Card>
          <CardHeader>
            <CardTitle>Gmail Integration</CardTitle>
            <CardDescription>
              Connect your Gmail account to receive and send scheduling emails
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-24 w-full" />}>
              <GmailConnectionSection
                userId={session.user.id}
                isConnected={!!userPreferences?.gmailAccessToken}
                assistantEmail={userPreferences?.assistantEmail}
              />
            </Suspense>
          </CardContent>
        </Card>

        {/* Calendar Connection */}
        <Card>
          <CardHeader>
            <CardTitle>Calendar Integration</CardTitle>
            <CardDescription>
              Connect your Google Calendar to check availability and schedule
              meetings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-24 w-full" />}>
              <CalendarConnectionSection
                userId={session.user.id}
                isConnected={!!userPreferences?.calendarAccessToken}
                calendarId={userPreferences?.calendarId}
              />
            </Suspense>
          </CardContent>
        </Card>

        {/* User Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Scheduling Preferences</CardTitle>
            <CardDescription>
              Configure your working hours, timezone, and scheduling preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <PreferencesForm
                userId={session.user.id}
                preferences={userPreferences}
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
