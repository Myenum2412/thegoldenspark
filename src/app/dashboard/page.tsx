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
import DashboardStats from "@/components/dashboard-stats";
import SetupNotice from "@/components/setup-notice";
import { SidebarUser, SidebarUserFallback } from "@/components/sidebar-user";
import { createClient } from "@/utils/supabase/server";
import type { Customer, Product } from "@/lib/store-data";

export default function Page() {
  return (
    <SidebarProvider>
      <DashboardShell
        title="Dashboard"
        userSlot={
          <Suspense fallback={<SidebarUserFallback />}>
            <SidebarUser />
          </Suspense>
        }
      >
        <Suspense fallback={<DashboardLoading />}>
          <DashboardData />
        </Suspense>
      </DashboardShell>
    </SidebarProvider>
  );
}

async function DashboardData() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: customerData, error: customerError } = await supabase
    .from("customers")
    .select("id, name, address, pincode, phone, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: productData, error: productError } = await supabase
    .from("products")
    .select("id, item_no, name, category, packing, mrp, special_rate, stock")
    .order("item_no", { ascending: true })
    .limit(200);

  const customers = (customerData ?? []) as Customer[];
  const products = (productData ?? []) as Product[];
  const loadError = customerError ?? productError;
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
            value: customerError ? "—" : String(customers.length),
            description: "Details submitted from the store website form.",
            icon: UsersIcon,
          },
          {
            name: "Total Products",
            value: productError ? "—" : String(products.length),
            description: "Items live in your pricelist.",
            icon: PackageIcon,
          },
          {
            name: "Stock Value",
            value: productError
              ? "—"
              : `₹${stockValue.toLocaleString("en-IN")}`,
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
          {loadError ? (
            <SetupNotice
              message={loadError.message}
              table={customerError ? "customers" : "products"}
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Pincode</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="h-24 text-center text-sm text-muted-foreground"
                      >
                        No customer submissions yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.slice(0, 5).map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell className="tabular-nums">
                          {c.phone}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {c.pincode}
                        </TableCell>
                      </TableRow>
                    ))
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