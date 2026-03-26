import { getNextMeeting } from "../actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Timer, Users, Calendar, ExternalLink } from "lucide-react";
import { formatDistanceToNow, format, differenceInMinutes } from "date-fns";
import Link from "next/link";

export async function NextMeeting() {
  const meeting = await getNextMeeting();

  if (!meeting) {
    return (
      <Card className="relative mb-8 border-none bg-card/50 backdrop-blur-md shadow-xl overflow-hidden group">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-50" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />
        </div>
        <CardContent className="pt-12 pb-12 relative z-10">
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-muted/50 border border-border/50 mb-8 group-hover:scale-110 transition-transform duration-700">
              <div className="absolute inset-0 rounded-3xl bg-primary/5 animate-pulse" />
              <Calendar className="h-10 w-10 text-muted-foreground/30 relative z-10" />
            </div>
            <h2 className="text-3xl font-tech font-bold mb-4 tracking-tight text-foreground">System Standby</h2>
            <p className="text-muted-foreground mb-10 max-w-sm mx-auto font-medium text-lg leading-relaxed">
              Your scheduling engine is active and monitoring for incoming missions.
            </p>
            <Button asChild variant="outline" className="font-tech text-[10px] tracking-[0.2em] px-10 py-6 h-auto border-border/60 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-500">
              <Link href="/email-threads">CHECK INCOMING DATA</Link>
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
                className="font-tech text-[10px] tracking-widest px-2 py-0.5 border-primary/30 text-primary bg-primary/5"
              >
                UPCOMING MISSION
              </Badge>
              {isWithinTwoHours && (
                      <Badge
                        variant="default"
                        className="font-tech text-[10px] tracking-widest px-2 py-0.5 bg-primary hover:bg-primary/90 animate-pulse"
                      >
                        STARTING SOON
                      </Badge>
              )}
            </div>
            <h2 className="text-3xl font-tech font-bold mb-4 tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
              {meeting.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-lg border border-border/40">
                <div className="h-8 w-8 rounded-md bg-background flex items-center justify-center border border-border/60">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-tech uppercase tracking-tighter opacity-60">Countdown</p>
                  <p className="text-foreground">{formatDistanceToNow(meeting.startTime, { addSuffix: true })}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-lg border border-border/40">
                <div className="h-8 w-8 rounded-md bg-background flex items-center justify-center border border-border/60">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-tech uppercase tracking-tighter opacity-60">Schedule</p>
                  <p className="text-foreground">
                    {format(meeting.startTime, "MMM d, h:mm a")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-lg border border-border/40">
                <div className="h-8 w-8 rounded-md bg-background flex items-center justify-center border border-border/60">
                  <Timer className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-tech uppercase tracking-tighter opacity-60">Duration</p>
                  <p className="text-foreground">{duration} min</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-lg border border-border/40">
                <div className="h-8 w-8 rounded-md bg-background flex items-center justify-center border border-border/60">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-tech uppercase tracking-tighter opacity-60">Personnel</p>
                  <p className="text-foreground">
                    {meeting.participants.length} Member{meeting.participants.length !== 1 ? "s" : ""}
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
                className="font-tech text-xs tracking-widest bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 px-8 py-6 h-auto"
              >
                <Link
                  href={meeting.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  JOIN NOW
                </Link>
              </Button>
            )}
            <Button
              asChild
              variant="outline"
              size="lg"
              className="font-tech text-xs tracking-widest px-8 py-6 h-auto border-border/60 hover:bg-muted/50 transition-all"
            >
              <Link href={`/meetings/${meeting.id}`}>DETAILS</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
