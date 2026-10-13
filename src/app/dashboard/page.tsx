"use client";

import * as React from "react";
import { PackageIcon, UsersIcon, WalletIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";
import RecentCustomers from "@/components/recent-customers";
import {
  DashboardLoading,
  DashboardShell,
} from "@/components/dashboard-shell";
import DashboardStats from "@/components/dashboard-stats";
import SetupNotice from "@/components/setup-notice";
import { SidebarUser } from "@/components/sidebar-user";
import { listCustomers, listProducts } from "@/lib/store";
import type { Customer, Product } from "@/lib/store-data";

export default function Page() {
  return (
    <SidebarProvider>
      <DashboardShell title="Dashboard" userSlot={<SidebarUser />}>
        <DashboardData />
      </DashboardShell>
    </SidebarProvider>
  );
}

function DashboardData() {
  const [customers, setCustomers] = React.useState<Customer[] | null>(null);
  const [products, setProducts] = React.useState<Product[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    let live = true;
    setError(null);
    Promise.all([listCustomers(), listProducts()])
      .then(([c, p]) => {
        if (live) {
          setCustomers(c);
          setProducts(p);
        }
      })
      .catch((err: unknown) => {
        if (live) setError(err instanceof Error ? err.message : "Failed to load data.");
      });
    return () => {
      live = false;
    };
  }, [refreshKey]);

  if (error) return <SetupNotice message={error} table="customers" />;
  if (!customers || !products) return <DashboardLoading />;

  const stockValue = products.reduce(
    (sum, p) => sum + Number(p.special_rate) * Number(p.stock),
    0
  );

  return (
    <>
      <DashboardStats
        stats={[
          {
            name: "Total Customers",
            value: String(customers.length),
            description: "Details submitted from the store website form.",
            icon: UsersIcon,
          },
          {
            name: "Total Products",
            value: String(products.length),
            description: "Items live in your pricelist.",
            icon: PackageIcon,
          },
          {
            name: "Stock Value",
            value: `₹${stockValue.toLocaleString("en-IN")}`,
            description: "Our rate × stock across products.",
            icon: WalletIcon,
          },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Recent Customers</CardTitle>
          <CardDescription>
            Latest details submitted from the store website form.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentCustomers
            customers={customers.slice(0, 5)}
            emptyText="No customer submissions yet."
            onChanged={() => {
              setCustomers(null);
              setRefreshKey((k) => k + 1);
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}
