import {
  getTodayMeetingsCount,
  getMeetingsThisWeekCount,
  getPendingRequestsCount,
  getGoogleConnectionStatus,
  getUserSetupStatus,
} from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export async function DashboardStats() {
  const [todayMeetings, meetingsThisWeek, pendingRequests, googleStatus, setupStatus] =
    await Promise.all([
      getTodayMeetingsCount(),
      getMeetingsThisWeekCount(),
      getPendingRequestsCount(),
      getGoogleConnectionStatus(),
      getUserSetupStatus(),
    ]);

  return (
    <div>
      {/* Setup Warning */}
      {setupStatus.completionPercentage < 100 && (
        <div className="bg-muted/30 border rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium mb-1">
                Complete your setup to see meeting statistics
              </h3>
              <p className="text-sm text-muted-foreground">
                Connect your Google account and set your scheduling preferences to start tracking your meetings.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Today&apos;s Meetings
          </CardTitle>
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <Calendar className="h-5 w-5 text-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline">
            <div className="text-3xl font-mono font-bold">{todayMeetings}</div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Scheduled for today
          </p>
          <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-foreground/80" style={{ width: "60%" }} />
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pending Requests
          </CardTitle>
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <Clock className="h-5 w-5 text-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-mono font-bold">{pendingRequests}</div>
            {pendingRequests > 0 && (
              <Badge
                variant="secondary"
                className="bg-muted text-foreground border"
              >
                Action needed
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Need your attention
          </p>
          {pendingRequests > 0 && (
            <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-foreground/80 animate-pulse"
                style={{ width: "80%" }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline">
            <div className="text-3xl font-bold font-mono">{meetingsThisWeek}</div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Meetings scheduled
          </p>
          <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-foreground/80" style={{ width: "70%" }} />
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Connection Status
          </CardTitle>
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            {googleStatus.connected ? (
              <CheckCircle className="h-5 w-5 text-foreground" />
            ) : (
              <AlertCircle className="h-5 w-5 text-foreground" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant={googleStatus.connected ? "default" : "secondary"}
              className={googleStatus.connected ? "" : "border bg-muted text-foreground"}
            >
              {googleStatus.connected ? "Connected" : "Setup Required"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {googleStatus.connected
              ? "Google Calendar & Gmail"
              : "Connect to get started"}
          </p>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
