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
import { Calendar, Mail, Zap } from "lucide-react";
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
    <Card className="border-none bg-card/50 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-tech tracking-tight">Recent Activity</CardTitle>
            <CardDescription className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60 mt-1">
              Live Scheduling Stream
            </CardDescription>
          </div>
          <div className="h-8 w-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {threads.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-muted/20 rounded-2xl bg-muted/5">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-tech font-medium mb-2">No active sessions</h3>
            <p className="text-sm text-muted-foreground max-w-[200px] mx-auto mb-6">
              Your scheduling engine is waiting for the first request.
            </p>
            {!googleStatus.connected && (
              <Button variant="outline" className="font-tech text-xs tracking-widest" asChild>
                <Link href="/settings">
                  <Mail className="mr-2 h-3 w-3" />
                  CONNECT GOOGLE
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/email-threads/${thread.id}`}
                className="block group/item"
              >
                <div className="flex items-center justify-between p-4 border border-border/40 rounded-xl bg-background/40 hover:bg-background hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-4 flex-1 min-w-0 relative z-10">
                    <div className="relative">
                      <div
                        className={`w-3 h-3 rounded-full ${getStatusColor(
                          thread.status
                        )} shadow-[0_0_8px_rgba(0,0,0,0.1)] ${thread.status === "pending" ? "animate-pulse ring-4 ring-orange-500/20" : ""}`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate group-hover/item:text-primary transition-colors font-modern">
                        {thread.subject || "Untitled Request"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-tech text-muted-foreground/80 uppercase tracking-tighter">
                          {thread.participants?.[0]?.split('@')[0] || "Unknown"}
                        </span>
                        <span className="text-[10px] text-muted-foreground/40">•</span>
                        <span className="text-[10px] font-medium text-muted-foreground/60">
                          {formatDistanceToNow(thread.createdAt, {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={getStatusVariant(thread.status)}
                    className="ml-4 font-tech text-[9px] tracking-widest px-2 py-0.5 border-none relative z-10"
                  >
                    {getStatusLabel(thread.status)}
                  </Badge>
                </div>
              </Link>
            ))}
            {threads.length >= 5 && (
              <Button
                variant="ghost"
                className="w-full text-xs font-tech tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                asChild
              >
                <Link href="/email-threads">VIEW ALL SESSIONS</Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
