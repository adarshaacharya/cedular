import {
  getAverageResponseTime,
  getMeetingsThisWeekCount,
  getPendingRequestsCount,
  getSuccessRate,
} from "../actions";
import { Card } from "@/components/ui/card";

export async function DashboardStats() {
  const [meetingsThisWeek, responseTime, successRate, pendingRequests] =
    await Promise.all([
      getMeetingsThisWeekCount(),
      getAverageResponseTime(),
      getSuccessRate(),
      getPendingRequestsCount(),
    ]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card className="p-6">
        <div className="text-sm text-muted-foreground mb-1">
          Meetings This Week
        </div>
        <div className="text-3xl font-bold text-foreground">
          {meetingsThisWeek}
        </div>
      </Card>

      <Card className="p-6">
        <div className="text-sm text-muted-foreground mb-1">
          Pending Requests
        </div>
        <div className="text-3xl font-bold text-foreground">
          {pendingRequests}
        </div>
      </Card>

      <Card className="p-6">
        <div className="text-sm text-muted-foreground mb-1">Response Time</div>
        <div className="text-3xl font-bold text-foreground">
          {responseTime ?? "—"}
        </div>
      </Card>

      <Card className="p-6">
        <div className="text-sm text-muted-foreground mb-1">Success Rate</div>
        <div className="text-3xl font-bold text-foreground">
          {successRate ?? "—"}
        </div>
      </Card>
    </div>
  );
}
