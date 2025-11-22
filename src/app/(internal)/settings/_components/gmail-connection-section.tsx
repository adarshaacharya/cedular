import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { connectGmail, disconnectGmail } from "../actions";

interface GmailConnectionSectionProps {
  userId: string;
  isConnected: boolean;
  assistantEmail: string | null | undefined;
}

export async function GmailConnectionSection({
  userId,
  isConnected,
  assistantEmail,
}: GmailConnectionSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {isConnected ? (
          <>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div className="flex-1">
              <p className="font-medium">Connected</p>
              {assistantEmail && (
                <p className="text-sm text-muted-foreground">
                  {assistantEmail}
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <XCircle className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">Not Connected</p>
              <p className="text-sm text-muted-foreground">
                Connect Gmail to start receiving scheduling requests
              </p>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-2">
        {isConnected ? (
          <form action={disconnectGmail}>
            <input type="hidden" name="userId" value={userId} />
            <Button type="submit" variant="outline" size="sm">
              Disconnect Gmail
            </Button>
          </form>
        ) : (
          <form action={connectGmail.bind(null, userId)}>
            <Button type="submit" size="sm">
              Connect Gmail
            </Button>
          </form>
        )}
      </div>

      {isConnected && (
        <div className="rounded-lg bg-muted p-4 text-sm">
          <p className="font-medium mb-1">How it works:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>
              Emails sent to {assistantEmail || "your assistant email"} are
              automatically processed
            </li>
            <li>AI analyzes the scheduling intent</li>
            <li>Responses are sent from your connected Gmail account</li>
          </ul>
        </div>
      )}
    </div>
  );
}
