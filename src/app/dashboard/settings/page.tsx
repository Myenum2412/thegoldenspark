"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardShell } from "@/components/dashboard-shell";
import { SidebarUser } from "@/components/sidebar-user";
import WaSettings from "@/components/wa-settings";
import ShopDetailsCard from "@/components/shop-details-card";
import { getShopDetails } from "@/lib/store.server";
import type { ShopDetails } from "@/lib/store.server";
import { useEffect, useState } from "react";

export default function Page() {
  const [shop, setShop] = useState<ShopDetails | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    getShopDetails()
      .then((s) => {
        if (live) {
          setShop(s);
          setLoading(false);
        }
      })
      .catch(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, []);

  if (loading) {
    return (
      <SidebarProvider>
        <DashboardShell title="Settings" userSlot={<SidebarUser />}>
          <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
            Loading…
          </div>
        </DashboardShell>
      </SidebarProvider>
    );
  }

  if (!shop) {
    return (
      <SidebarProvider>
        <DashboardShell title="Settings" userSlot={<SidebarUser />}>
          <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
            Unable to load shop details.
          </div>
        </DashboardShell>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <DashboardShell title="Settings" userSlot={<SidebarUser />}>
        <div className="grid gap-4 md:grid-cols-2">
          <ShopDetailsCard shop={shop} editing={editing} onEditToggle={setEditing} />
          <WaSettings />
        </div>
      </DashboardShell>
    </SidebarProvider>
  );
}
