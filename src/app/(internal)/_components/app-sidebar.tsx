"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Calendar,
  Mail,
  Settings,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Navigation items for our dashboard
  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      title: "Meetings",
      url: "/meetings",
      icon: Calendar,
      isActive: pathname.startsWith("/meetings"),
    },
    {
      title: "Chat Assistant",
      url: "/chat",
      icon: MessageCircle,
      isActive: pathname.startsWith("/chat"),
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
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
