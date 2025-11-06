import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Card } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome back,{" "}
            {session?.user?.name || session?.user?.email || "User"}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your scheduling.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">
              Meetings This Week
            </div>
            <div className="text-3xl font-bold text-foreground">0</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">
              Pending Requests
            </div>
            <div className="text-3xl font-bold text-foreground">0</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">
              Response Time
            </div>
            <div className="text-3xl font-bold text-foreground">—</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">
              Success Rate
            </div>
            <div className="text-3xl font-bold text-foreground">—</div>
          </Card>
        </div>

        <Card className="p-8">
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Your dashboard is ready! Connect your email and calendar to start
              scheduling meetings automatically.
            </p>
            <div className="space-y-2">
              <p className="font-medium text-foreground">Next steps:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Connect your Google account</li>
                <li>Set your working hours and preferences</li>
                <li>Get your unique assistant email address</li>
                <li>Start CC&apos;ing Cedular on scheduling emails</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
