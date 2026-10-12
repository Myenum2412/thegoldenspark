import { Suspense } from "react";
import { cookies } from "next/headers";
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
  const statsByCustomer = new Map<string, { count: number; total: number }>();
  for (const o of (orderData ?? []) as {
    customer_id: number | null;
    total: number;
  }[]) {
    if (o.customer_id == null) continue;
    const key = String(o.customer_id);
    const st = statsByCustomer.get(key) ?? { count: 0, total: 0 };
    st.count += 1;
    st.total += Number(o.total);
    statsByCustomer.set(key, st);
  }
  const stats = Object.fromEntries(statsByCustomer);

  return (
    <>
      <DashboardStats
        stats={[
          {
            name: "Total Customers",
            value: error ? "—" : String(customers.length),
            description: "Details submitted from the store website.",
            icon: UsersIcon,
          },
          {
            name: "Customers with Orders",
            value: error ? "—" : String(statsByCustomer.size),
            description: "Placed at least one order.",
            icon: ClipboardListIcon,
          },
          {
            name: "New This Month",
            value: error
              ? "—"
              : String(
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
            <CustomersTable customers={customers} stats={stats} />
          )}
        </CardContent>
      </Card>
    </>
  );
}