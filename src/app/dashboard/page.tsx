"use client";

import * as React from "react";
import { PackageIcon, UsersIcon, WalletIcon, ClockIcon, AlertTriangleIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";
import RecentCustomers from "@/components/recent-customers";
import RecentOrders from "@/components/recent-orders";
import LowStockAlert from "@/components/low-stock-alert";
import QuickActions from "@/components/quick-actions";
import {
  DashboardLoading,
  DashboardShell,
} from "@/components/dashboard-shell";
import DashboardStats from "@/components/dashboard-stats";
import SetupNotice from "@/components/setup-notice";
import { SidebarUser } from "@/components/sidebar-user";
import { listCustomers, listProducts, listOrders } from "@/lib/store";
import type { Customer, Product } from "@/lib/store-data";
import type { Order } from "@/components/order-view";

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
  const [orders, setOrders] = React.useState<Order[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    let live = true;
    setError(null);
    Promise.all([listCustomers(), listProducts(), listOrders()])
      .then(([c, p, o]) => {
        if (live) {
          setCustomers(c);
          setProducts(p);
          setOrders(o);
        }
      })
      .catch((err: unknown) => {
        if (live) setError(err instanceof Error ? err.message : "Failed to load data.");
      });
    return () => {
      live = false;
    };
  }, [refreshKey]);

  if (error) return <SetupNotice message={error} table="dashboard" />;
  if (!customers || !products || !orders) return <DashboardLoading />;

  const stockValue = products.reduce(
    (sum, p) => sum + Number(p.special_rate) * Number(p.stock),
    0
  );
  const orderValue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const lowStockCount = products.filter((p) => Number(p.stock) <= 10).length;

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
            name: "Total Orders",
            value: String(orders.length),
            description: "Checkouts from the homepage pricelist.",
            icon: ClockIcon,
          },
          {
            name: "Order Value",
            value: `₹${orderValue.toLocaleString("en-IN")}`,
            description: "Sum of all order totals.",
            icon: WalletIcon,
          },
          {
            name: "Stock Value",
            value: `₹${stockValue.toLocaleString("en-IN")}`,
            description: "Our rate × stock across products.",
            icon: WalletIcon,
          },
          {
            name: "Low Stock",
            value: String(lowStockCount),
            description: "Products with stock ≤ 10 units.",
            icon: AlertTriangleIcon,
          },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <LowStockAlert products={products} />
        <RecentOrders orders={orders} />
      </div>

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

      <QuickActions />
    </>
  );
}
