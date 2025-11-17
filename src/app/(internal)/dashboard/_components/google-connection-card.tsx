import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { ConnectToGoogle } from "./connect-google";
import { getGoogleConnectionStatus } from "../actions";
import { Show } from "@/components/show";

export async function GoogleConnectionCard() {
  const googleStatus = await getGoogleConnectionStatus();

  return (
    <Show if={!googleStatus.connected}>
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
                <Button variant="outline" size="sm" disabled>
                  Connected
                </Button>
              </div>
            </div>
          ) : (
            <ConnectToGoogle />
          )}
        </CardContent>
      </Card>
    </Show>
  );
}
