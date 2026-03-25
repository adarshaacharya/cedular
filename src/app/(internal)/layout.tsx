import { Suspense } from "react";
import { Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/app-sidebar";
import { ChatHistoryTrigger } from "./_components/chat-history-trigger";
import { getServerSession } from "@/lib/auth/get-session";
import { getUserPreferences } from "./settings/actions";

const fontApp = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
});

async function InternalSidebar() {
  const session = await getServerSession();
  const assistantEmail = session?.user?.id
    ? (await getUserPreferences(session.user.id))?.assistantEmail
    : null;

  return (
    <AppSidebar
      assistantEmail={assistantEmail}
      chatHistoryTrigger={<ChatHistoryTrigger className="w-full justify-start" />}
    />
  );
}

export default function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      className={cn(
        fontApp.className,
        "antialiased"
      )}
    >
      <Suspense fallback={<div />}>
        <InternalSidebar />
      </Suspense>
      <SidebarInset
        className="border-l border-border/50 bg-linear-to-b from-muted/30 via-background to-background"
      >
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
