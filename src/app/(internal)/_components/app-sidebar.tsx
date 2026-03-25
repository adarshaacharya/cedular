"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Calendar,
  Mail,
  Settings,
  MessageCircle,
  Send,
  LifeBuoy,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth/client";

import { NavMain } from "@/components/navbar/nav-main";
import { NavUser } from "@/components/navbar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavSecondary } from "@/components/navbar/nav-secondary";
import { SidebarThemeToggler } from "./sidebar-theme-toggler";
import { CedularLogo } from "@/components/brand/cedular-logo";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  chatHistoryTrigger?: React.ReactNode;
  assistantEmail?: string | null;
}

const SUPPORT_EMAIL = "hi@adarsha.dev";

export function AppSidebar({
  chatHistoryTrigger,
  assistantEmail,
  ...props
}: AppSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  

  // Assistant section - AI-focused features
  const navAssistant = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      title: "Chat Assistant",
      url: "#",
      icon: MessageCircle,
      items: [
        {
          title: "New Chat",
          url: "/chat",
        },
        {
          title: "History",
          component: chatHistoryTrigger,
        },
      ],
    },
  ];

  // Workspace section - Core business tools
  const navWorkspace = [
    {
      title: "Calendar",
      url: "/calendar",
      icon: Calendar,
      isActive: pathname.startsWith("/calendar"),
    },
    {
      title: "Meetings",
      url: "/meetings",
      icon: Users,
      isActive: pathname.startsWith("/meetings"),
    },
    {
      title: "Email Threads",
      url: "/email-threads",
      icon: Mail,
      isActive: pathname.startsWith("/email-threads"),
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      isActive: pathname.startsWith("/settings"),
    },
  ];

  const navSecondary = [
    {
      title: "Feedback",
      url: `mailto:${SUPPORT_EMAIL}`,
      icon: Send,
    },
  ];

  // User data from session
  const user = session?.user
    ? {
      name: session.user.name || "User",
      email: session.user.email || "",
      avatar: session.user.image || "",
      assistantEmail: assistantEmail || "",
    }
    : {
      name: "User",
      email: "",
      avatar: "",
      assistantEmail: "",
    };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between w-full">
              <SidebarMenuButton size="lg" className="flex-1">
                <div className="flex aspect-square size-12 items-center justify-center rounded-lg">
                  <CedularLogo className="h-9 w-9" />
                </div>
                <div className="grid flex-1 text-left text-md leading-tight">
                  <span className="truncate font-semibold tracking-tight">
                    Cedular
                  </span>
                  <span className="truncate text-xs text-muted-foreground font-normal tracking-wide uppercase">
                    Workspace
                  </span>
                </div>
              </SidebarMenuButton>
              <SidebarThemeToggler />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navAssistant} label="Assistant" />
        <NavMain items={navWorkspace} label="Workspace" />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
