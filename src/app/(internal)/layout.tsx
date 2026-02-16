import { Suspense } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/app-sidebar";
import { ChatHistoryTrigger } from "./_components/chat-history-trigger";
import { getServerSession } from "@/lib/auth/get-session";
import { getUserPreferences } from "./settings/actions";

export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  const assistantEmail = session?.user?.id
    ? (await getUserPreferences(session.user.id))?.assistantEmail
    : null;

  return (
    <SidebarProvider>
  
      <Suspense fallback={<div />}>
        <AppSidebar
          assistantEmail={assistantEmail}
          chatHistoryTrigger={
            <ChatHistoryTrigger className="w-full justify-start" />
          }
        />
      </Suspense>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
