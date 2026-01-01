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
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
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
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  chatHistoryTrigger?: React.ReactNode;
}

export function AppSidebar({ chatHistoryTrigger, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

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
      title: "Support",
      url: "#",
      icon: LifeBuoy,
      onClick: () => {
        window.open("mailto:hello@adarsha.dev", "_blank");
      },
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
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
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between w-full">
              <SidebarMenuButton size="lg" className="flex-1">
                <div className=" flex aspect-square size-12 items-center justify-center rounded-lg">
                  <Image
                    src="/icons/calendar-clock.svg"
                    alt="Cedular Logo"
                    width={32}
                    height={32}
                    className="w-24 h-24"
                  />
                </div>
                <div className="grid flex-1 text-left text-md leading-tight">
                  <span className="truncate font-medium">Cedular</span>
                </div>
              </SidebarMenuButton>
              <Button
                variant="ghost"
                size="sm"
                onClick={cycleTheme}
                className="h-8 w-8 p-0 ml-2"
              >
                {theme === "light" ? (
                  <Sun className="h-4 w-4" />
                ) : theme === "dark" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Monitor className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
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
