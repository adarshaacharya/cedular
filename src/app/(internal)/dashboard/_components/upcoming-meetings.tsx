import { getUpcomingMeetings } from "../actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";

export async function UpcomingMeetings() {
  const meetings = await getUpcomingMeetings();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>Upcoming Meetings</CardTitle>
        <CardDescription>
          Your confirmed meetings for the next few days
        </CardDescription>
      </CardHeader>
      <CardContent>
        {meetings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              No upcoming meetings scheduled
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/email-threads">Check Requests</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {meetings.map((meeting) => {
              const timeUntil = formatDistanceToNow(meeting.time, {
                addSuffix: true,
              });

              return (
                <div
                  key={meeting.id}
                  className="flex flex-col gap-2 p-3 border rounded-lg hover:bg-muted/50 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                          {meeting.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(meeting.time, "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-500 shrink-0">
                      Confirmed
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground ml-6">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{timeUntil}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>
                        {meeting.participants} participant
                        {meeting.participants > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {meetings.length >= 3 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full hover:bg-primary hover:text-primary-foreground transition-colors"
                asChild
              >
                <Link href="/calendar">View All Meetings</Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
