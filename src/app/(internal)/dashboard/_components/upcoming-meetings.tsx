import { getUpcomingMeetings } from "../actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users } from "lucide-react";
import { format } from "date-fns";

export async function UpcomingMeetings() {
  const meetings = await getUpcomingMeetings();

  if (meetings.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Meetings</CardTitle>
        <CardDescription>
          Your confirmed meetings for the next few days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{meeting.title}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    {meeting.participants} participant
                    {meeting.participants > 1 ? "s" : ""} •{" "}
                    {format(meeting.time, "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
              <Badge>Confirmed</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
