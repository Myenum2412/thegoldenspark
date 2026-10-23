"use client";

import * as React from "react";
import { ClipboardListIcon, PackageIcon, WalletIcon, CalendarIcon, TrendingUpIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  DashboardLoading,
  DashboardShell,
} from "@/components/dashboard-shell";
import {
  type Order,
  type OrderItem,
} from "@/components/order-view";
import OrdersTable from "@/components/orders-table";
import WaStatus from "@/components/wa-status";
import MonthlySales from "@/components/monthly-sales";
import DashboardStats from "@/components/dashboard-stats";
import SetupNotice from "@/components/setup-notice";
import { SidebarUser } from "@/components/sidebar-user";
import { listCustomers, listOrderItems, listOrders } from "@/lib/store";

export default function Page() {
  return (
    <SidebarProvider>
      <DashboardShell title="Orders" userSlot={<SidebarUser />}>
        <OrdersData />
      </DashboardShell>
    </SidebarProvider>
  );
}

function OrdersData() {
  const [orders, setOrders] = React.useState<Order[] | null>(null);
  const [items, setItems] = React.useState<OrderItem[] | null>(null);
  const [addresses, setAddresses] = React.useState<Record<string, string> | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    let live = true;
    setError(null);
    Promise.all([listOrders(), listOrderItems(), listCustomers()])
      .then(([orderRows, itemRows, customerRows]) => {
        if (!live) return;
        setOrders(orderRows);
        setItems(itemRows);
        setAddresses(
          Object.fromEntries(customerRows.map((c) => [String(c.id), c.address]))
        );
      })
      .catch((err: unknown) => {
        if (live) setError(err instanceof Error ? err.message : "Failed to load data.");
      });
    return () => {
      live = false;
    };
  }, [refreshKey]);

  if (error) return <SetupNotice message={error} table="orders" />;
  if (!orders || !items || !addresses) return <DashboardLoading />;

  const itemsByOrder = new Map<string, OrderItem[]>();
  for (const it of items) {
    const key = String(it.order_id);
    const list = itemsByOrder.get(key) ?? [];
    list.push(it);
    itemsByOrder.set(key, list);
  }
  const orderValue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const itemsSold = Array.from(itemsByOrder.values())
    .flat()
    .reduce((n, it) => n + Number(it.qty), 0);
  const newOrders = orders.filter((o) => o.status === "new").length;

  return (
    <>
      <DashboardStats
        stats={[
          {
            name: "Total Orders",
            value: String(orders.length),
            description: "Checkouts from the homepage pricelist.",
            icon: ClipboardListIcon,
          },
          {
            name: "Order Value",
            value: `₹${orderValue.toLocaleString("en-IN")}`,
            description: "Sum of all order totals.",
            icon: WalletIcon,
          },
          {
            name: "Items Sold",
            value: String(itemsSold),
            description: "Total quantity across orders.",
            icon: PackageIcon,
          },
          {
            name: "New Orders",
            value: String(newOrders),
            description: "Orders with status 'new'.",
            icon: CalendarIcon,
          },
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <MonthlySales orders={orders} />
      </div>
      <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Orders{" "}
          <span className="text-muted-foreground">({orders.length})</span>
          <WaStatus />
        </CardTitle>
        <CardDescription>
          Every checkout from the homepage pricelist, stored in Appwrite.
        </CardDescription>
      </CardHeader>
        <CardContent>
          <OrdersTable
            orders={orders}
            items={items}
            addresses={addresses}
            onChanged={() => {
              setOrders(null);
              setItems(null);
              setAddresses(null);
              setRefreshKey((k) => k + 1);
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}
