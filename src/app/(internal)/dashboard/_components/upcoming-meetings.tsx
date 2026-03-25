import { getUpcomingMeetings } from "../actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";

export async function UpcomingMeetings() {
  const meetings = await getUpcomingMeetings();

  return (
    <Card className="border-none bg-card/50 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold tracking-tight">
              Upcoming meetings
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Confirmed on your calendar
            </CardDescription>
          </div>
          <div className="h-8 w-8 rounded-lg bg-green-500/5 border border-green-500/10 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-green-500" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {meetings.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-muted/20 rounded-2xl bg-muted/5">
            <Calendar className="mx-auto h-10 w-10 text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              No meetings scheduled yet
            </p>
            <Button variant="ghost" size="sm" className="text-sm hover:text-primary" asChild>
              <Link href="/email-threads">Check requests</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => {
              const timeUntil = formatDistanceToNow(meeting.time, {
                addSuffix: true,
              });

              return (
                <div
                  key={meeting.id}
                  className="flex flex-col gap-3 p-4 border border-border/40 rounded-xl bg-background/40 hover:bg-background hover:border-green-500/30 hover:shadow-lg transition-all duration-300 group/item relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rounded-full -mr-8 -mt-8 group-hover/item:bg-green-500/10 transition-colors" />
                  <div className="flex items-start justify-between gap-3 relative z-10">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm group-hover/item:text-green-600 transition-colors truncate dark:group-hover/item:text-green-400">
                        {meeting.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1 tabular-nums">
                        {format(meeting.time, "MMM d, h:mm a")}
                      </p>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-medium text-muted-foreground/60 relative z-10">
                    <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-md">
                      <Clock className="h-3 w-3 text-green-500/70" />
                      <span>{timeUntil}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-md">
                      <Users className="h-3 w-3 text-green-500/70" />
                      <span>
                        {meeting.participants} guest
                        {meeting.participants !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {meetings.length >= 2 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-sm text-muted-foreground hover:text-green-600 hover:bg-green-500/5 transition-all dark:hover:text-green-400"
                asChild
              >
                <Link href="/calendar">Open calendar</Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
