"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardShell } from "@/components/dashboard-shell";
import { SidebarUser } from "@/components/sidebar-user";
import WaSettings from "@/components/wa-settings";

export default function Page() {
  return (
    <SidebarProvider>
      <DashboardShell title="Settings" userSlot={<SidebarUser />}>
        <WaSettings />
      </DashboardShell>
    </SidebarProvider>
  );
}
