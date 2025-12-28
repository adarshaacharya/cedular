"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Calendar,
  Mail,
  Settings,
  Sparkles,
  MessageCircle,
  Send,
  LifeBuoy,
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
  SidebarRail,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "@/components/navbar/team-switcher";
import { NavSecondary } from "@/components/navbar/nav-secondary";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
          url: "/chat/history",
        },
      ],
    },
  ];

  // Workspace section - Core business tools
  const navWorkspace = [
    {
      title: "Meetings",
      url: "/meetings",
      icon: Calendar,
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
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ];

  // Team switcher data (just using Cedular as the team)
  const teams = [
    {
      name: "Cedular",
      logo: Sparkles,
      plan: "Pro",
    },
  ];

  // User data from session
  const user = session?.user
    ? {
        name: session.user.name || "User",
        email: session.user.email || "",
        avatar: session.user.image || "",
      }
    : {
        name: "User",
        email: "",
        avatar: "",
      };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
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
