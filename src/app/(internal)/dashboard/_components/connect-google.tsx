"use client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export function ConnectToGoogle() {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    // Redirect to OAuth initiation endpoint
    window.location.href = "/api/auth/google";
  };

  return (
    <Button onClick={handleConnect} disabled={isConnecting} className="w-full">
      {isConnecting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        "Connect Google Account"
      )}
    </Button>
  );
}
