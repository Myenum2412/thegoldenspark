import { Suspense } from "react";
import { cookies } from "next/headers";
import { ClipboardListIcon, PackageIcon, WalletIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DashboardLoading,
  DashboardShell,
} from "@/components/dashboard-shell";
import OrderView, {
  type Order,
  type OrderItem,
} from "@/components/order-view";
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
        <CardTitle>
          Orders{" "}
          {!error && (
            <span className="text-muted-foreground">({orders.length})</span>
          )}
        </CardTitle>
        <CardDescription>
          Every checkout from the homepage pricelist, stored in Supabase.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <SetupNotice message={error.message} table="orders" />
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Total (₹)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Placed</TableHead>
                  <TableHead className="w-16 text-right">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-sm text-muted-foreground"
                    >
                      No orders yet — checkouts from the homepage will appear
                      here automatically.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((o) => {
                    const items = itemsByOrder.get(String(o.id)) ?? [];
                    const qty = items.reduce((n, it) => n + Number(it.qty), 0);
                    return (
                      <TableRow key={o.id}>
                        <TableCell className="font-medium tabular-nums">
                          #{String(o.id)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {o.customer_name}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {o.phone}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {qty}
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums text-amber-600">
                          {Number(o.total).toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{o.status}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {o.created_at
                            ? new Date(o.created_at).toLocaleString("en-IN")
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <OrderView
                              order={o}
                              items={items}
                              address={
                                o.customer_id != null
                                  ? addressByCustomer.get(
                                      String(o.customer_id)
                                    )
                                  : undefined
                              }
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      </Card>
    </>
  );
}
