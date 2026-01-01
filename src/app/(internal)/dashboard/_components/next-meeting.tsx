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
      <Card className="mb-8 shadow-sm">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Image
              src="/icons/calendar.svg"
              alt="No Upcoming Meetings"
              width={64}
              height={64}
              className="mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold mb-2">No Upcoming Meetings</h2>
            <p className="text-muted-foreground mb-4">
              Your schedule is clear. Time to focus on your work!
            </p>
            <Button asChild variant="outline">
              <Link href="/email-threads">Check Scheduling Requests</Link>
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
    <Card className="mb-8 shadow-sm">
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="secondary"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                Next Meeting
              </Badge>
              {isWithinTwoHours && (
                <Badge
                  variant="secondary"
                  className="bg-orange-50 text-orange-700 border-orange-200 animate-pulse"
                >
                  Starting Soon
                </Badge>
              )}
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
              {meeting.title}
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">
                  {formatDistanceToNow(meeting.startTime, { addSuffix: true })}
                </span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(meeting.startTime, "MMM d, h:mm a")} -{" "}
                  {format(meeting.endTime, "h:mm a")}
                </span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{duration} min</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>
                  {meeting.participants.length} participant
                  {meeting.participants.length > 1 ? "s" : ""}
                </span>
              </div>
              {meeting.meetingLink && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate max-w-xs">Online Meeting</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {meeting.meetingLink && (
            <Button asChild size="lg" variant="outline">
              <Link
                href={meeting.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                Join Meeting
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
