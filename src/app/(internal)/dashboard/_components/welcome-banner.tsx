import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { getPendingRequestsCount, getUserSetupStatus } from "../actions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Card } from "@/components/ui/card";

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

  const [pendingRequests, setupStatus] = await Promise.all([
    getPendingRequestsCount(),
    getUserSetupStatus(),
  ]);

  const userName =
    session?.user?.name || session?.user?.email?.split("@")[0] || "there";
  const greeting = getTimeBasedGreeting();

  // Show setup progress if incomplete
  if (setupStatus.completionPercentage < 100) {
    return (
      <Card className="border-2 border-dashed border-muted-foreground/20 bg-muted/30 rounded-xl p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold mb-2">
              Welcome, {userName}! Let&apos;s get you started
            </h1>
            <p className="text-muted-foreground mb-4">
              Complete your setup to start scheduling meetings automatically
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Setup Progress</span>
                <span className="text-muted-foreground">
                  {setupStatus.completionPercentage}%
                </span>
              </div>
              <Progress
                value={setupStatus.completionPercentage}
                className="h-2"
              />
              <div className="flex flex-wrap gap-2">
                {!setupStatus.googleConnected && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-muted text-muted-foreground border">
                    Connect Google Account
                  </span>
                )}
                {!setupStatus.preferencesSet && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-muted text-muted-foreground border">
                    Set Scheduling Preferences
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            {!setupStatus.googleConnected && (
              <Button variant="outline" asChild>
                <Link href="/settings?tab=integrations">Connect Google </Link>
              </Button>
            )}
            {!setupStatus.preferencesSet && (
              <Button asChild>
                <Link href="/settings?tab=preferences">Set Preferences</Link>
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Normal welcome banner when setup is complete
  return (
    <Card className="  border   rounded-xl p-6 mb-8">
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
    </Card>
  );
}
