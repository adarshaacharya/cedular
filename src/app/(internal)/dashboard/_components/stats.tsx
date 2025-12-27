import {
  getTodayMeetingsCount,
  getMeetingsThisWeekCount,
  getPendingRequestsCount,
  getGoogleConnectionStatus,
} from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";

export async function DashboardStats() {
  const [todayMeetings, meetingsThisWeek, pendingRequests, googleStatus] =
    await Promise.all([
      getTodayMeetingsCount(),
      getMeetingsThisWeekCount(),
      getPendingRequestsCount(),
      getGoogleConnectionStatus(),
    ]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Today&apos;s Meetings
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todayMeetings}</div>
          <p className="text-xs text-muted-foreground">Scheduled for today</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pending Requests
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingRequests}</div>
          <p className="text-xs text-muted-foreground">Need your attention</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{meetingsThisWeek}</div>
          <p className="text-xs text-muted-foreground">Meetings scheduled</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Connection Status
          </CardTitle>
          {googleStatus.connected ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-orange-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant={googleStatus.connected ? "default" : "secondary"}>
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
  );
}
