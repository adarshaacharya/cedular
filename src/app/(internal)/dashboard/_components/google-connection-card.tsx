"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface GoogleConnectionCardProps {
  connected: boolean;
  email: string | null;
}

export function GoogleConnectionCard({
  connected,
  email,
}: GoogleConnectionCardProps) {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    // Redirect to OAuth initiation endpoint
    window.location.href = "/api/auth/google";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Google Integration
          {connected ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-muted-foreground" />
          )}
        </CardTitle>
        <CardDescription>
          {connected
            ? "Your Google account is connected. You can receive and send emails via Gmail."
            : "Connect your Google account to enable Gmail and Calendar integration."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {connected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-sm text-muted-foreground">
                  Connected as {email}
                </p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Connected
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect Google Account"
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
