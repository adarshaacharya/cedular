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
import { GreenBlink } from "@/components/atoms/green-blink";

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
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
                  <GreenBlink size="md" />
                  <span className="text-xs font-medium text-green-600">
                    Online
                  </span>
                </div>
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
