"use client";

import { NotificationBell } from "@/components/NotificationBell";
import { SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { ClerkLoaded, ClerkLoading, UserButton } from "@clerk/nextjs";

export function DashboardHeader({ children }: { children: React.ReactNode }) {
  return (
    <SidebarInset>
      <header className="flex h-14 items-center gap-2 border-b px-4">
        <SidebarTrigger />

        <div className="ml-auto flex gap-2">
          <div className="flex items-center space-x-4">
            <ClerkLoading>
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            </ClerkLoading>
            <ClerkLoaded>
              <NotificationBell />
            </ClerkLoaded>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>
      <div className="p-4">{children}</div>
    </SidebarInset>
  );
}
