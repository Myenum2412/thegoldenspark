import { Suspense } from "react";
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
        <ReportsData />
      </Suspense>
    </SidebarProvider>
  );
}

async function ReportsData() {
  const { supabase, user } = await requireUser();

  const { data: customerData, error: customerError } = await supabase
    .from("customers")
    .select("id, name, phone, pincode, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const { data: productData, error: productError } = await supabase
    .from("products")
    .select("id, name, category, price, stock")
    .limit(500);

  const customers = (customerData ?? []) as Customer[];
  const products = (productData ?? []) as Product[];
  const loadError = customerError ?? productError;
  const stockValue = products.reduce(
    (sum, p) => sum + Number(p.price) * Number(p.stock),
    0
  );
  const lowStock = products.filter((p) => Number(p.stock) <= 10);

  return (
    <DashboardShell email={user.email ?? ""} title="Reports">
      {loadError ? (
        <SetupNotice
          message={loadError.message}
          table={customerError ? "customers" : "products"}
        />
      ) : (
        <>
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  <UsersIcon className="size-5" aria-hidden="true" />
                </span>
                <CardTitle className="text-base">Total Enquiries</CardTitle>
              </CardHeader>
              <CardContent className="-mt-2">
                <p className="text-3xl font-bold tabular-nums">
                  {customers.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Customer form submissions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  <PackageIcon className="size-5" aria-hidden="true" />
                </span>
                <CardTitle className="text-base">Products Live</CardTitle>
              </CardHeader>
              <CardContent className="-mt-2">
                <p className="text-3xl font-bold tabular-nums">
                  {products.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  {lowStock.length} low on stock (≤ 10)
                </p>
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
                  ₹{stockValue.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-muted-foreground">
                  Price × stock across products
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Latest Enquiries</CardTitle>
              <CardDescription>
                Most recent customer submissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Pincode</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="h-24 text-center text-sm text-muted-foreground"
                        >
                          No enquiries yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      customers.slice(0, 10).map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">
                            {c.name}
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {c.phone}
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {c.pincode}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {c.created_at
                              ? new Date(c.created_at).toLocaleString("en-IN")
                              : "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
