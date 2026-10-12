import { Suspense } from "react";
import Link from "next/link";
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
import SetupNotice from "@/components/setup-notice";
import { requireUser } from "@/lib/require-user";
import type { Customer, Product } from "@/lib/store-data";

export default function Page() {
  return (
    <SidebarProvider>
      <Suspense fallback={<DashboardLoading />}>
        <DashboardData />
      </Suspense>
    </SidebarProvider>
  );
}

async function DashboardData() {
  const { supabase, user } = await requireUser();

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
    <DashboardShell email={user.email ?? ""} title="Dashboard">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <UsersIcon className="size-5" aria-hidden="true" />
            </span>
            <CardTitle className="text-base">Total Customers</CardTitle>
          </CardHeader>
          <CardContent className="-mt-2">
            <p className="text-3xl font-bold tabular-nums">
              {customerError ? "—" : customers.length}
            </p>
            <Link
              href="/dashboard/customers"
              className="text-xs text-amber-600 hover:text-amber-500"
            >
              View all →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <PackageIcon className="size-5" aria-hidden="true" />
            </span>
            <CardTitle className="text-base">Total Products</CardTitle>
          </CardHeader>
          <CardContent className="-mt-2">
            <p className="text-3xl font-bold tabular-nums">
              {productError ? "—" : products.length}
            </p>
            <Link
              href="/dashboard/products"
              className="text-xs text-amber-600 hover:text-amber-500"
            >
              View all →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <WalletIcon className="size-5" aria-hidden="true" />
            </span>
            <CardTitle className="text-base">Stock Value</CardTitle>
          </CardHeader>
          <CardContent className="-mt-2">
            <p className="text-3xl font-bold tabular-nums">
              {productError
                ? "—"
                : `₹${stockValue.toLocaleString("en-IN")}`}
            </p>
            <Link
              href="/dashboard/reports"
              className="text-xs text-amber-600 hover:text-amber-500"
            >
              View reports →
            </Link>
          </CardContent>
        </Card>
      </div>

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
    </DashboardShell>
  );
}
