import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/app-sidebar";
import { ChatHistoryTrigger } from "./_components/chat-history-trigger";
import { getServerSession } from "@/lib/auth/get-session";
import { getUserPreferences } from "./settings/actions";
import { redirect } from "next/navigation";

async function InternalSidebar() {
  const session = await getServerSession();
  const assistantEmail = session?.user?.id
    ? (await getUserPreferences(session.user.id))?.assistantEmail
    : null;

  return (
    <AppSidebar
      assistantEmail={assistantEmail}
      chatHistoryTrigger={
        <ChatHistoryTrigger className="w-full justify-start" />
      }
    />
  );
}

export default function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div />}>
      <InternalLayoutContent>{children}</InternalLayoutContent>
    </Suspense>
  );
}

async function InternalLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <SidebarProvider className={cn("font-tech antialiased")}>
      <Suspense fallback={<div />}>
        <InternalSidebar />
      </Suspense>
      <SidebarInset className="bg-background">
        <div className="mx-auto w-full max-w-(--breakpoint-2xl)">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
