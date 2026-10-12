import { Suspense } from "react";
import { cookies } from "next/headers";
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
import { SidebarUser, SidebarUserFallback } from "@/components/sidebar-user";
import { createClient } from "@/utils/supabase/server";
import type { Customer, Product } from "@/lib/store-data";

export default function Page() {
  return (
    <SidebarProvider>
      <DashboardShell
        title="Reports"
        userSlot={
          <Suspense fallback={<SidebarUserFallback />}>
            <SidebarUser />
          </Suspense>
        }
      >
        <Suspense fallback={<DashboardLoading />}>
          <ReportsData />
        </Suspense>
      </DashboardShell>
    </SidebarProvider>
  );
}

async function ReportsData() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: customerData, error: customerError } = await supabase
    .from("customers")
    .select("id, name, phone, pincode, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const { data: productData, error: productError } = await supabase
    .from("products")
    .select("id, item_no, name, category, packing, mrp, special_rate, stock")
    .limit(500);

  const customers = (customerData ?? []) as Customer[];
  const products = (productData ?? []) as Product[];
  const loadError = customerError ?? productError;
  const stockValue = products.reduce(
    (sum, p) => sum + Number(p.special_rate) * Number(p.stock),
    0
  );
  const lowStock = products.filter((p) => Number(p.stock) <= 10);

  return (
    <>
      {loadError ? (
        <SetupNotice
          message={loadError.message}
          table={customerError ? "customers" : "products"}
        />
      ) : (
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
                name: "Products Live",
                value: String(products.length),
                description: `${lowStock.length} low on stock (≤ 10)`,
                icon: PackageIcon,
              },
              {
                name: "Stock Value",
                value: `₹${stockValue.toLocaleString("en-IN")}`,
                description: "Price × stock across products",
                icon: WalletIcon,
              },
            ]}
          />

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
              />
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}