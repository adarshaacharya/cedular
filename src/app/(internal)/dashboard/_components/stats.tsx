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
  Zap,
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
        <div className="bg-muted/30 border border-border/60 rounded-lg p-4 mb-6 ring-1 ring-border/40">
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

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 mb-8">
      <Card className="relative overflow-hidden border-none bg-card/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 group">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
          <Calendar className="h-24 w-24 -mr-8 -mt-8 rotate-12" />
        </div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-tech font-medium tracking-widest uppercase text-muted-foreground">
            Today&apos;s Meetings
          </CardTitle>
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform duration-500">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline">
            <div className="text-4xl font-tech font-bold tracking-tighter">{todayMeetings}</div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-medium">
            Scheduled for today
          </p>
          <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: "60%" }} />
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-none bg-card/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 group">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
          <Clock className="h-24 w-24 -mr-8 -mt-8 rotate-12" />
        </div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-tech font-medium tracking-widest uppercase text-muted-foreground">
            Pending Requests
          </CardTitle>
          <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 group-hover:scale-110 transition-transform duration-500">
            <Clock className="h-5 w-5 text-accent" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-tech font-bold tracking-tighter">{pendingRequests}</div>
            {pendingRequests > 0 && (
              <Badge
                variant="secondary"
                className="bg-accent/10 text-accent border-accent/20 font-medium text-xs px-2"
              >
                Action needed
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-medium">
            Need your attention
          </p>
          {pendingRequests > 0 && (
            <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-accent animate-pulse"
                style={{ width: "80%" }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-none bg-card/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 group">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
          <CheckCircle className="h-24 w-24 -mr-8 -mt-8 rotate-12" />
        </div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-tech font-medium tracking-widest uppercase text-muted-foreground">This Week</CardTitle>
          <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20 group-hover:scale-110 transition-transform duration-500">
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline">
            <div className="text-4xl font-tech font-bold tracking-tighter">{meetingsThisWeek}</div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-medium">
            Meetings scheduled
          </p>
          <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-green-500 transition-all duration-1000 ease-out" style={{ width: "70%" }} />
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-none bg-card/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 group">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
          <Zap className="h-24 w-24 -mr-8 -mt-8 rotate-12" />
        </div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-tech font-medium tracking-widest uppercase text-muted-foreground">
            Connection Status
          </CardTitle>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-110 ${
            googleStatus.connected 
              ? "bg-primary/10 border-primary/20" 
              : "bg-destructive/10 border-destructive/20"
          }`}>
            {googleStatus.connected ? (
              <CheckCircle className="h-5 w-5 text-primary" />
            ) : (
              <AlertCircle className="h-5 w-5 text-destructive" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant={googleStatus.connected ? "default" : "destructive"}
              className={`text-xs font-medium px-2 ${googleStatus.connected ? "bg-primary" : "bg-destructive"}`}
            >
              {googleStatus.connected ? "Connected" : "Setup required"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-medium">
            {googleStatus.connected
              ? "Google Calendar & Gmail"
              : "Connection required"}
          </p>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
