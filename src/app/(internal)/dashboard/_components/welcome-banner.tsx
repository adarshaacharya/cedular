import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import {
  getGoogleConnectionStatus,
  getPendingRequestsCount,
  getUserSetupStatus,
} from "../actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function getTimeBasedGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export async function WelcomeBanner() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const [googleStatus, pendingRequests, setupStatus] = await Promise.all([
    getGoogleConnectionStatus(),
    getPendingRequestsCount(),
    getUserSetupStatus(),
  ]);

  const userName =
    session?.user?.name || session?.user?.email?.split("@")[0] || "there";
  const greeting = getTimeBasedGreeting();

  // Show setup banner if incomplete
  if (setupStatus.completionPercentage < 100) {
    return (
      <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-amber-900 dark:text-amber-100 mb-2">
              Welcome, {userName}! Let&apos;s get you set up
            </h1>
            <p className="text-amber-700 dark:text-amber-300 mb-2">
              Complete your setup to start scheduling meetings automatically
            </p>
            <div className="flex items-center gap-4 text-sm text-amber-600 dark:text-amber-400">
              <span>Setup progress: {setupStatus.completionPercentage}%</span>
              <div className="flex gap-1">
                {!setupStatus.googleConnected && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                    Google Account
                  </span>
                )}
                {!setupStatus.preferencesSet && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                    Preferences
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            {!setupStatus.googleConnected && (
              <Button variant="outline" asChild size="lg">
                <Link href="/settings">Connect Google</Link>
              </Button>
            )}
            {!setupStatus.preferencesSet && (
              <Button asChild size="lg">
                <Link href="/settings">Set Preferences</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Normal welcome banner when setup is complete
  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-6 mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {greeting}, {userName}!
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Ready to schedule your day?
          </p>
        </div>
        <div className="flex gap-3">
          {pendingRequests > 0 && (
            <Button asChild size="lg">
              <Link href="/email-threads">
                Review {pendingRequests} Request{pendingRequests > 1 ? "s" : ""}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
