"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
  label,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url?: string;
      component?: React.ReactNode;
    }[];
  }[];
  label?: string;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label || "Platform"}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // If item has sub-items, render as collapsible
          if (item.items && item.items.length > 0) {
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={cn(
                        "transition-all duration-200",
                        item.isActive
                          ? "bg-primary/5 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {item.icon && (
                        <item.icon
                          className={cn(
                            "size-4",
                            item.isActive
                              ? "text-primary"
                              : "text-muted-foreground",
                          )}
                        />
                      )}
                      <span className="tracking-tight">{item.title}</span>
                      <ChevronRight className="ml-auto size-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          {subItem.component ? (
                            <div className="px-2 py-1.5">
                              {subItem.component}
                            </div>
                          ) : (
                            <SidebarMenuSubButton asChild>
                              <Link href={subItem.url || "#"}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          )}
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          // If item has no sub-items, render as simple button
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={cn(
                  "transition-all duration-200",
                  item.isActive
                    ? "bg-primary/5 text-primary font-medium shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Link href={item.url}>
                  {item.icon && (
                    <item.icon
                      className={cn(
                        "size-4",
                        item.isActive
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                    />
                  )}
                  <span className="tracking-tight">{item.title}</span>
                  {item.isActive && (
                    <div className="ml-auto flex h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
