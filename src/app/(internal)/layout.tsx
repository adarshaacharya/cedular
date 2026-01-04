import { Suspense } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/app-sidebar";
import { AuthRedirector } from "@/components/auth-redirector";
import { ChatHistoryTrigger } from "./_components/chat-history-trigger";

export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
  
      <Suspense fallback={<div />}>
        <AppSidebar
          chatHistoryTrigger={
            <ChatHistoryTrigger className="w-full justify-start" />
          }
        />
      </Suspense>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
