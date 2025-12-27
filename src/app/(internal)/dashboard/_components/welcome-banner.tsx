import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { getGoogleConnectionStatus, getPendingRequestsCount } from "../actions";
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

  const [googleStatus, pendingRequests] = await Promise.all([
    getGoogleConnectionStatus(),
    getPendingRequestsCount(),
  ]);

  const userName =
    session?.user?.name || session?.user?.email?.split("@")[0] || "there";
  const greeting = getTimeBasedGreeting();

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
          {!googleStatus.connected && (
            <Button variant="outline" asChild size="lg">
              <Link href="/settings">Connect Google Account</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
