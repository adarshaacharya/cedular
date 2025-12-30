import { Suspense } from "react";
import { SettingsLoadingSkeleton } from "./skeleton";
import { SettingsContent } from "./_components/settings-content";


export default async function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <Suspense fallback={<SettingsLoadingSkeleton />}>
        <SettingsContent />
      </Suspense>
    </div>
  );
}
