import { Suspense } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/app-sidebar";
import { ChatHistoryTrigger } from "./_components/chat-history-trigger";
import { getServerSession } from "@/lib/auth/get-session";
import { getUserPreferences } from "./settings/actions";

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
    <SidebarProvider>
      <Suspense fallback={<div />}>
        <InternalSidebar />
      </Suspense>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
