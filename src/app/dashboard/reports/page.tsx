"use client";

import * as React from "react";
import { PackageIcon, UsersIcon, WalletIcon, TrophyIcon, BarChart3Icon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";
import RecentCustomers from "@/components/recent-customers";
import MonthlySales from "@/components/monthly-sales";
import TopProducts from "@/components/top-products";
import {
  DashboardLoading,
  DashboardShell,
} from "@/components/dashboard-shell";
import DashboardStats from "@/components/dashboard-stats";
import SetupNotice from "@/components/setup-notice";
import { SidebarUser } from "@/components/sidebar-user";
import { listCustomers, listProducts, listOrders, listOrderItems } from "@/lib/store";
import type { Customer, Product } from "@/lib/store-data";
import type { Order, OrderItem } from "@/components/order-view";

export default function Page() {
  return (
    <SidebarProvider>
      <DashboardShell title="Reports" userSlot={<SidebarUser />}>
        <ReportsData />
      </DashboardShell>
    </SidebarProvider>
  );
}

function ReportsData() {
  const [customers, setCustomers] = React.useState<Customer[] | null>(null);
  const [products, setProducts] = React.useState<Product[] | null>(null);
  const [orders, setOrders] = React.useState<Order[] | null>(null);
  const [items, setItems] = React.useState<OrderItem[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    let live = true;
    setError(null);
    Promise.all([listCustomers(), listProducts(), listOrders(), listOrderItems()])
      .then(([c, p, o, it]) => {
        if (live) {
          setCustomers(c);
          setProducts(p);
          setOrders(o);
          setItems(it);
        }
      })
      .catch((err: unknown) => {
        if (live) setError(err instanceof Error ? err.message : "Failed to load data.");
      });
    return () => {
      live = false;
    };
  }, [refreshKey]);

  if (error) return <SetupNotice message={error} table="reports" />;
  if (!customers || !products || !orders || !items) return <DashboardLoading />;

  const stockValue = products.reduce(
    (sum, p) => sum + Number(p.special_rate) * Number(p.stock),
    0
  );
  const lowStock = products.filter((p) => Number(p.stock) <= 10);
  const orderValue = orders.reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <>
      <DashboardStats
        stats={[
          {
            name: "Total Enquiries",
            value: String(customers.length),
            description: "Customer form submissions",
            icon: UsersIcon,
          },
          {
            name: "Total Orders",
            value: String(orders.length),
            description: "Completed checkouts",
            icon: PackageIcon,
          },
          {
            name: "Revenue",
            value: `₹${orderValue.toLocaleString("en-IN")}`,
            description: "Total order value",
            icon: WalletIcon,
          },
          {
            name: "Products Live",
            value: String(products.length),
            description: `${lowStock.length} low on stock (≤ 10)`,
            icon: TrophyIcon,
          },
          {
            name: "Stock Value",
            value: `₹${stockValue.toLocaleString("en-IN")}`,
            description: "Price × stock across products",
            icon: WalletIcon,
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <MonthlySales orders={orders} />
        <TopProducts products={products} items={items} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest Enquiries</CardTitle>
          <CardDescription>
            Most recent customer submissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentCustomers
            customers={customers.slice(0, 10)}
            showSubmitted
            emptyText="No enquiries yet."
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
