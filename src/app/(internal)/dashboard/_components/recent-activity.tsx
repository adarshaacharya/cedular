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

function getStatusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "pending":
      return "outline";
    case "processing":
      return "secondary";
    case "scheduled":
    case "confirmed":
      return "default";
    case "failed":
      return "destructive";
    default:
      return "secondary";
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case "pending":
      return "bg-orange-500";
    case "processing":
      return "bg-blue-500";
    case "scheduled":
    case "confirmed":
      return "bg-green-500";
    case "failed":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

function getStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export async function RecentActivity() {
  const [threads, googleStatus] = await Promise.all([
    getRecentThreads(),
    getGoogleConnectionStatus(),
  ]);

  return (
    <Card className="hover:shadow-lg transition-shadow">
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
          <div className="space-y-3">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/email-threads/${thread.id}`}
                className="block"
              >
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`w-2 h-2 rounded-full ${getStatusColor(
                        thread.status
                      )} ${thread.status === "pending" ? "animate-pulse" : ""}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate group-hover:text-primary transition-colors">
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
                  <Badge
                    variant={getStatusVariant(thread.status)}
                    className="ml-2"
                  >
                    {getStatusLabel(thread.status)}
                  </Badge>
                </div>
              </Link>
            ))}
            {threads.length >= 5 && (
              <Button
                variant="outline"
                className="w-full hover:text-primary-foreground transition-colors"
                asChild
              >
                <Link href="/email-threads">View All Requests</Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
