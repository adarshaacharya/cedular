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
  TrendingUp,
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
        <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                Complete your setup to see meeting statistics
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Connect your Google account and set your scheduling preferences to start tracking your meetings.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {/* Today's Meetings - Blue */}
      <Card className="hover:shadow-lg transition-shadow border-blue-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Today&apos;s Meetings
          </CardTitle>
          <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold">{todayMeetings}</div>
            <span className="text-xs text-green-500 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +0%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Scheduled for today
          </p>
          <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: "60%" }} />
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests - Orange */}
      <Card className="hover:shadow-lg transition-shadow border-orange-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pending Requests
          </CardTitle>
          <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
            <Clock className="h-5 w-5 text-orange-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold">{pendingRequests}</div>
            {pendingRequests > 0 && (
              <Badge
                variant="secondary"
                className="bg-orange-500/10 text-orange-600 border-0"
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
                className="h-full bg-orange-500 animate-pulse"
                style={{ width: "80%" }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* This Week - Green */}
      <Card className="hover:shadow-lg transition-shadow border-green-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold">{meetingsThisWeek}</div>
            <span className="text-xs text-green-500 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +0%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Meetings scheduled
          </p>
          <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-green-500" style={{ width: "70%" }} />
          </div>
        </CardContent>
      </Card>

      {/* Connection Status - Purple */}
      <Card
        className={`hover:shadow-lg transition-shadow ${
          googleStatus.connected
            ? "border-purple-500/20"
            : "border-orange-500/30 bg-orange-500/5"
        }`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Connection Status
          </CardTitle>
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center ${
              googleStatus.connected ? "bg-purple-500/10" : "bg-orange-500/10"
            }`}
          >
            {googleStatus.connected ? (
              <CheckCircle className="h-5 w-5 text-purple-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-orange-500" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant={googleStatus.connected ? "default" : "secondary"}
              className={
                googleStatus.connected ? "bg-purple-500" : "bg-orange-500"
              }
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
