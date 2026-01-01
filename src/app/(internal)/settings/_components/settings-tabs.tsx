"use client";

import { useSearchParams, useRouter } from "next/navigation";
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
import {
  UserPreferences,
  UserScheduleProfile,
} from "@/prisma/generated/prisma/client";
import { parseAsStringEnum, useQueryState } from "nuqs";

interface SettingsTabsProps {
  userId: string;
  userPreferences: UserPreferences | null;
  scheduleProfile: UserScheduleProfile | null;
}

enum TabType {
  PREFERENCES = "preferences",
  INTEGRATIONS = "integrations",
}

export function SettingsTabs({
  userId,
  userPreferences,
  scheduleProfile,
}: SettingsTabsProps) {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringEnum<TabType>(Object.values(TabType))
  );

  const currentTab = tab || TabType.PREFERENCES;

  const handleTabChange = (value: string) => {
    setTab(value as TabType);
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
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
              Configure your working hours, timezone, and scheduling preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PreferencesForm
              userId={userId}
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
              userId={userId}
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
  );
}
