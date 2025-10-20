import React from "react";
import { DashboardSidebar } from "../_components/Sidebar";
import { DashboardHeader } from "../_components/Header";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardSidebar>
      <DashboardHeader>{children}</DashboardHeader>
    </DashboardSidebar>
  );
}

export default DashboardLayout;
