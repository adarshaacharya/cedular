import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getUserPreferences, getUserScheduleProfile } from "../actions";
import { SettingsTabs } from "./settings-tabs";

export async function SettingsContent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
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

      <SettingsTabs
        userId={session.user.id}
        userPreferences={userPreferences}
        scheduleProfile={scheduleProfile}
      />
    </div>
  );
}
