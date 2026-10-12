import { Suspense } from "react";
import { cookies } from "next/headers";
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
import SetupNotice from "@/components/setup-notice";
import { SidebarUser, SidebarUserFallback } from "@/components/sidebar-user";
import { createClient } from "@/utils/supabase/server";
import type { Customer } from "@/lib/store-data";

export default function Page() {
  return (
    <SidebarProvider>
      <DashboardShell
        title="Customers"
        userSlot={
          <Suspense fallback={<SidebarUserFallback />}>
            <SidebarUser />
          </Suspense>
        }
      >
        <Suspense fallback={<DashboardLoading />}>
          <CustomersData />
        </Suspense>
      </DashboardShell>
    </SidebarProvider>
  );
}

async function CustomersData() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("customers")
    .select("id, name, address, pincode, phone, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const customers = (data ?? []) as Customer[];

  const { data: orderData } = await supabase
    .from("orders")
    .select("id, customer_id, total");
  const statsByCustomer = new Map<
    string,
    { count: number; total: number }
  >();
  for (const o of (orderData ?? []) as {
    customer_id: number | null;
    total: number;
  }[]) {
    if (o.customer_id == null) continue;
    const key = String(o.customer_id);
    const s = statsByCustomer.get(key) ?? { count: 0, total: 0 };
    s.count += 1;
    s.total += Number(o.total);
    statsByCustomer.set(key, s);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Customers{" "}
            {!error && (
              <span className="text-muted-foreground">
                ({customers.length})
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Every detail submitted from the store website form, stored in
            Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <SetupNotice message={error.message} table="customers" />
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Pincode</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-sm text-muted-foreground"
                      >
                        No customer submissions yet — new form entries will
                        appear here automatically.
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((c) => {
                      const stats = statsByCustomer.get(String(c.id));
                      return (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">
                            {c.name}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            {c.address}
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {c.pincode}
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {c.phone}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {stats ? (
                              <>
                                {stats.count} · ₹
                                {stats.total.toLocaleString("en-IN")}
                              </>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                          {c.created_at
                            ? new Date(c.created_at).toLocaleString("en-IN")
                            : "—"}
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
  );
}