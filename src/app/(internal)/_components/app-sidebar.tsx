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
import Link from "next/link";

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
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between w-full">
              <SidebarMenuButton size="lg" className="flex-1" asChild>
                <Link href="/dashboard">
                  <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-primary/5 ring-1 ring-primary/10">
                    <CedularLogo className="h-7 w-7" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-bold tracking-tight text-foreground">
                        Cedular
                      </span>
                      <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    </div>
                    <span className="truncate text-[10px] text-muted-foreground font-medium tracking-widest uppercase">
                      Protocol v1.0
                    </span>
                  </div>
                </Link>
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
