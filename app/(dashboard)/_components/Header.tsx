"use client";

import { SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";

export function DashboardHeader({ children }: { children: React.ReactNode }) {
  return (
    <SidebarInset>
      <header className="flex h-14 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <div className="ml-auto">
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>
      <div className="p-4">{children}</div>
    </SidebarInset>
  );
}
