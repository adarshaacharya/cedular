import { Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";

export function MeetingsEmptyState() {
  return (
    <Card className="flex flex-col items-center justify-center p-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Calendar className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No meetings yet</h3>
      <p className="text-muted-foreground max-w-sm">
        Meetings will appear here once they are scheduled from your email
        threads. Start by processing scheduling requests from your inbox.
      </p>
    </Card>
  );
}
