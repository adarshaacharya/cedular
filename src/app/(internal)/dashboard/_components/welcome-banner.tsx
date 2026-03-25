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
      <Card className="mb-8 overflow-hidden border border-dashed border-primary/25 bg-muted/20 p-6 shadow-sm rounded-xl ring-1 ring-border/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
              Getting started
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-2">
              Welcome, {userName}
              <span className="text-muted-foreground font-normal">
                {" "}
                — let&apos;s finish setup
              </span>
            </h1>
            <p className="text-muted-foreground mb-4 leading-relaxed">
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
    <Card className="relative mb-8 overflow-hidden border border-border/60 bg-card/80 p-6 sm:p-8 shadow-sm rounded-xl ring-1 ring-border/40">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(from_var(--primary)_l_c_h/0.08),transparent)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.25]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, oklch(from var(--foreground) l c h / 0.06) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            System active
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
            {greeting},{" "}
            <span className="bg-linear-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              {userName}
            </span>
            !
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl">
            Your assistant is connected—CC it on threads or open chat when you
            need to move a meeting.
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          {pendingRequests > 0 && (
            <Button asChild size="lg" className="shadow-md">
              <Link href="/email-threads">
                Review {pendingRequests} request
                {pendingRequests > 1 ? "s" : ""}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
