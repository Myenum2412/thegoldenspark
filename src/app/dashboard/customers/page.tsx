"use client";

import * as React from "react";
import { CalendarIcon, ClipboardListIcon, UsersIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";
import CustomersTable from "@/components/customers-table";
import {
  DashboardLoading,
  DashboardShell,
} from "@/components/dashboard-shell";
import SetupNotice from "@/components/setup-notice";
import DashboardStats from "@/components/dashboard-stats";
import { SidebarUser } from "@/components/sidebar-user";
import { listCustomers, listOrders } from "@/lib/store";
import type { Customer } from "@/lib/store-data";

export default function Page() {
  return (
    <SidebarProvider>
      <DashboardShell title="Customers" userSlot={<SidebarUser />}>
        <CustomersData />
      </DashboardShell>
    </SidebarProvider>
  );
}

function CustomersData() {
  const [customers, setCustomers] = React.useState<Customer[] | null>(null);
  const [stats, setStats] = React.useState<Record<string, { count: number; total: number }> | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    let live = true;
    setError(null);
    Promise.all([listCustomers(), listOrders()])
      .then(([customerRows, orderRows]) => {
        if (!live) return;
        const statsByCustomer = new Map<string, { count: number; total: number }>();
        for (const o of orderRows) {
          if (o.customer_id == null) continue;
          const key = String(o.customer_id);
          const st = statsByCustomer.get(key) ?? { count: 0, total: 0 };
          st.count += 1;
          st.total += Number(o.total);
          statsByCustomer.set(key, st);
        }
        setCustomers(customerRows);
        setStats(Object.fromEntries(statsByCustomer));
      })
      .catch((err: unknown) => {
        if (live) setError(err instanceof Error ? err.message : "Failed to load data.");
      });
    return () => {
      live = false;
    };
  }, [refreshKey]);

  if (error) return <SetupNotice message={error} table="customers" />;
  if (!customers || !stats) return <DashboardLoading />;

  return (
    <>
      <DashboardStats
        stats={[
          {
            name: "Total Customers",
            value: String(customers.length),
            description: "Details submitted from the store website.",
            icon: UsersIcon,
          },
          {
            name: "Customers with Orders",
            value: String(Object.keys(stats).length),
            description: "Placed at least one order.",
            icon: ClipboardListIcon,
          },
          {
            name: "New This Month",
            value: String(
              customers.filter((c) => {
                if (!c.created_at) return false;
                const d = new Date(c.created_at);
                const now = new Date();
                return (
                  d.getMonth() === now.getMonth() &&
                  d.getFullYear() === now.getFullYear()
                );
              }).length
            ),
            description: "Joined in the current month.",
            icon: CalendarIcon,
          },
        ]}
      />
      <Card>
      <CardHeader>
        <CardTitle>
          Customers{" "}
          <span className="text-muted-foreground">({customers.length})</span>
        </CardTitle>
          <CardDescription>
            Every detail submitted from the store website form, stored in
            Appwrite.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomersTable
            customers={customers}
            stats={stats}
            onChanged={() => {
              setCustomers(null);
              setStats(null);
              setRefreshKey((k) => k + 1);
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}
