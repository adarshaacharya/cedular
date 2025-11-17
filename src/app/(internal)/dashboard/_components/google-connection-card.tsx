import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import { ConnectToGoogle } from "./connect-google";
import { getGoogleConnectionStatus } from "../actions";

// Online status indicator with live signal
function OnlineIndicator() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
      <div className="relative inline-flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 animate-ping" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-green-600" />
      </div>
      <span className="text-xs font-medium text-green-600">Online</span>
    </div>
  );
}

export async function GoogleConnectionCard() {
  const googleStatus = await getGoogleConnectionStatus();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Google Integration
            {googleStatus.connected ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-muted-foreground" />
            )}
          </CardTitle>
          <CardDescription>
            {googleStatus.connected
              ? "Your Google account is connected. You can receive and send emails via Gmail."
              : "Connect your Google account to enable Gmail and Calendar integration."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {googleStatus.connected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm text-muted-foreground">
                    Connected as {googleStatus.email}
                  </p>
                </div>
                <OnlineIndicator />
              </div>
            </div>
          ) : (
            <ConnectToGoogle />
          )}
        </CardContent>
      </Card>
    </>
  );
}
