import { Card } from "@/components/ui/card";
import { getEmailThreadsStats } from "../actions";
import { Mail, Clock, Inbox, Signal } from "lucide-react";

function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

export async function EmailThreadsStats() {
  const stats = await getEmailThreadsStats();

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Inbox className="h-4 w-4" />
          Total threads
        </div>
        <div className="text-3xl font-semibold text-foreground">
          {formatNumber(stats.total)}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Pending
        </div>
        <div className="text-3xl font-semibold text-foreground">
          {formatNumber(stats.pending)}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          Awaiting confirmation
        </div>
        <div className="text-3xl font-semibold text-foreground">
          {formatNumber(stats.awaitingConfirmation)}
        </div>
      </Card>

      <Card className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Signal className="h-4 w-4" />
          Status distribution
        </div>
        <div className="grid gap-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span className="text-foreground">Processing</span>
            <span>{formatNumber(stats.processing)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground">Scheduled</span>
            <span>{formatNumber(stats.scheduled)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground">Confirmed</span>
            <span>{formatNumber(stats.confirmed)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground">Failed</span>
            <span>{formatNumber(stats.failed)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
