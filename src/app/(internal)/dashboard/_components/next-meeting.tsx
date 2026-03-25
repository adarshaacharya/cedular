import { getNextMeeting } from "../actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, MapPin, Calendar, ExternalLink } from "lucide-react";
import { formatDistanceToNow, format, differenceInMinutes } from "date-fns";
import Link from "next/link";
import Image from "next/image";

export async function NextMeeting() {
  const meeting = await getNextMeeting();

  if (!meeting) {
    return (
      <Card className="mb-8 border-none bg-card/50 backdrop-blur-md shadow-xl overflow-hidden group">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-50" />
        <CardContent className="pt-10 pb-10 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/50 border border-border/50 mb-6 group-hover:scale-110 transition-transform duration-500">
              <Calendar className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h2 className="text-2xl font-semibold mb-3 tracking-tight text-foreground">
              No upcoming meetings
            </h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto font-medium">
              Your schedule is clear. Time to focus on your deep work!
            </p>
            <Button asChild variant="outline" className="text-sm px-8">
              <Link href="/email-threads">Check scheduling requests</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const minutesUntil = differenceInMinutes(meeting.startTime, new Date());
  const isWithinTwoHours = minutesUntil <= 120 && minutesUntil > 0;
  const duration = differenceInMinutes(meeting.endTime, meeting.startTime);

  return (
    <Card className="mb-8 border-none bg-card/50 backdrop-blur-md shadow-xl overflow-hidden group relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors duration-700" />
      <CardContent className="pt-8 pb-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <Badge
                variant="outline"
                className="text-xs font-medium px-2 py-0.5 border-primary/30 text-primary bg-primary/5"
              >
                Next meeting
              </Badge>
              {isWithinTwoHours && (
                <Badge
                  variant="default"
                  className="text-xs font-medium bg-orange-500 hover:bg-orange-600 animate-pulse"
                >
                  Starting soon
                </Badge>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4 tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
              {meeting.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-lg border border-border/40">
                <div className="h-8 w-8 rounded-md bg-background flex items-center justify-center border border-border/60">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Starts
                  </p>
                  <p className="text-foreground">{formatDistanceToNow(meeting.startTime, { addSuffix: true })}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-lg border border-border/40">
                <div className="h-8 w-8 rounded-md bg-background flex items-center justify-center border border-border/60">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Time
                  </p>
                  <p className="text-foreground">{format(meeting.startTime, "MMM d, h:mm a")}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-lg border border-border/40">
                <div className="h-8 w-8 rounded-md bg-background flex items-center justify-center border border-border/60">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Guests
                  </p>
                  <p className="text-foreground">
                    {meeting.participants.length} participant
                    {meeting.participants.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            {meeting.meetingLink && (
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 shadow-md px-8 py-6 h-auto"
              >
                <Link
                  href={meeting.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Join meeting
                </Link>
              </Button>
            )}
            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 py-6 h-auto border-border/60"
            >
              <Link href={`/meetings/${meeting.id}`}>Meeting details</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
