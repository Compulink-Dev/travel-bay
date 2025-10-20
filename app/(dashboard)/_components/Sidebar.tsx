"use client";

import Link from "next/link";
import {
  Sidebar as UISidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Home, ClipboardList, Users, Plane, Hotel, Table2 } from "lucide-react";
import { usePathname } from "next/navigation";

export function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const link = (href: string) => ({ href, active: pathname === href });

  return (
    <SidebarProvider>
      <UISidebar>
        <SidebarHeader>
          <div className="px-2 py-1 text-sm font-semibold">Travel Bay</div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={link("/dashboard").active}>
                    <Link href="/dashboard">
                      <Home /> <span>Home</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={link("/dashboard/todo").active}>
                    <Link href="/dashboard/todo">
                      <ClipboardList /> <span>Todo</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={link("/dashboard/leads").active}>
                    <Link href="/dashboard/leads">
                      <Users /> <span>Leads</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={link("/dashboard/customers").active}>
                    <Link href="/dashboard/customers">
                      <Users /> <span>Customers</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarSeparator />
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={link("/dashboard/hotels").active}>
                    <Link href="/dashboard/hotels">
                      <Hotel /> <span>Hotels</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={link("/dashboard/travels").active}>
                    <Link href="/dashboard/travels">
                      <Plane /> <span>Travels</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={link("/dashboard/bookings").active}>
                    <Link href="/dashboard/bookings">
                      <Table2 /> <span>Bookings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </UISidebar>
      {children}
    </SidebarProvider>
  );
}
