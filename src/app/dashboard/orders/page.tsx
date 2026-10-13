import { Suspense } from "react";
import { cookies } from "next/headers";
import { ClipboardListIcon, PackageIcon, WalletIcon } from "lucide-react";
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
import DashboardStats from "@/components/dashboard-stats";
import SetupNotice from "@/components/setup-notice";
import { SidebarUser, SidebarUserFallback } from "@/components/sidebar-user";
import { createClient } from "@/utils/supabase/server";

export default function Page() {
  return (
    <SidebarProvider>
      <DashboardShell
        title="Orders"
        userSlot={
          <Suspense fallback={<SidebarUserFallback />}>
            <SidebarUser />
          </Suspense>
        }
      >
        <Suspense fallback={<DashboardLoading />}>
          <OrdersData />
        </Suspense>
      </DashboardShell>
    </SidebarProvider>
  );
}

async function OrdersData() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .select("id, customer_id, customer_name, phone, total, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const { data: itemData, error: itemError } = await supabase
    .from("order_items")
    .select("id, order_id, item_no, name, qty, rate, amount")
    .limit(2000);

  const { data: addressData } = await supabase
    .from("customers")
    .select("id, address");
  const addressByCustomer = new Map(
    ((addressData ?? []) as { id: string | number; address: string }[]).map(
      (c) => [String(c.id), c.address]
    )
  );

  const error = orderError ?? itemError;
  const orders = (orderData ?? []) as Order[];
  const itemsByOrder = new Map<string, OrderItem[]>();
  for (const it of (itemData ?? []) as OrderItem[]) {
    const key = String(it.order_id);
    const list = itemsByOrder.get(key) ?? [];
    list.push(it);
    itemsByOrder.set(key, list);
  }
  const orderValue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const itemsSold = Array.from(itemsByOrder.values())
    .flat()
    .reduce((n, it) => n + Number(it.qty), 0);

  return (
    <>
      <DashboardStats
        stats={[
          {
            name: "Total Orders",
            value: error ? "—" : String(orders.length),
            description: "Checkouts from the homepage pricelist.",
            icon: ClipboardListIcon,
          },
          {
            name: "Order Value",
            value: error ? "—" : `₹${orderValue.toLocaleString("en-IN")}`,
            description: "Sum of all order totals.",
            icon: WalletIcon,
          },
          {
            name: "Items Sold",
            value: error ? "—" : String(itemsSold),
            description: "Total quantity across orders.",
            icon: PackageIcon,
          },
        ]}
      />
      <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Orders{" "}
          {!error && (
            <span className="text-muted-foreground">({orders.length})</span>
          )}
          <WaStatus />
        </CardTitle>
        <CardDescription>
          Every checkout from the homepage pricelist, stored in Supabase.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <SetupNotice message={error.message} table="orders" />
        ) : (
          <OrdersTable
            orders={orders}
            items={(itemData ?? []) as OrderItem[]}
            addresses={Object.fromEntries(addressByCustomer)}
          />
        )}
      </CardContent>
      </Card>
    </>
  );
}
