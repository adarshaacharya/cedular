import { getRecentThreads, getGoogleConnectionStatus } from "../actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

function getStatusVariant(status: string) {
  switch (status) {
    case "pending":
      return "secondary";
    case "processing":
      return "default";
    case "scheduled":
      return "default";
    case "confirmed":
      return "default";
    case "failed":
      return "destructive";
    default:
      return "secondary";
  }
}

export async function RecentActivity() {
  const [threads, googleStatus] = await Promise.all([
    getRecentThreads(),
    getGoogleConnectionStatus(),
  ]);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Your latest scheduling requests and updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        {threads.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No recent activity</h3>
            <p className="text-muted-foreground mb-4">
              Your scheduling requests will appear here once you start receiving
              them.
            </p>
            {!googleStatus.connected && (
              <Button variant="outline" asChild>
                <Link href="/settings">
                  <Mail className="mr-2 h-4 w-4" />
                  Connect Google Account
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {threads.map((thread) => (
              <div
                key={thread.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">
                      {thread.subject || "No subject"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {thread.participants?.[0]} •{" "}
                      {formatDistanceToNow(thread.createdAt, {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
                <Badge variant={getStatusVariant(thread.status)}>
                  {thread.status}
                </Badge>
              </div>
            ))}
            {threads.length >= 5 && (
              <Button variant="outline" className="w-full" asChild>
                <Link href="/email-threads">View All Requests</Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
