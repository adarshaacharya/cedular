
import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PreferencesForm } from "./preferences-form";
import { GoogleServicesSection } from "./google-services-section";
import { getUserPreferences, getUserScheduleProfile } from "../actions";

export async function SettingsContent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const userPreferences = await getUserPreferences(session.user.id);
  const scheduleProfile = await getUserScheduleProfile(session.user.id);

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account preferences and integrations
        </p>
      </div>

      <Tabs defaultValue="preferences" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-6">
          {/* User Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Scheduling Preferences</CardTitle>
              <CardDescription>
                Configure your working hours, timezone, and scheduling
                preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PreferencesForm
                userId={session.user.id}
                preferences={userPreferences}
                scheduleProfile={scheduleProfile}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          {/* Google Services Connection */}
          <Card>
            <CardHeader>
              <CardTitle>Google Services Integration</CardTitle>
              <CardDescription>
                Connect your Google account to enable Gmail processing and
                Calendar scheduling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GoogleServicesSection
                userId={session.user.id}
                isConnected={
                  !!userPreferences?.gmailAccessToken &&
                  !!userPreferences?.calendarAccessToken
                }
                assistantEmail={userPreferences?.assistantEmail}
                calendarId={userPreferences?.calendarId}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
