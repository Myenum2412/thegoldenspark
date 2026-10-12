import { Suspense } from "react";
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
import AddProductForm from "@/components/add-product-form";
import {
  DashboardLoading,
  DashboardShell,
} from "@/components/dashboard-shell";
import SetupNotice from "@/components/setup-notice";
import { requireUser } from "@/lib/require-user";
import type { Product } from "@/lib/store-data";

export default function Page() {
  return (
    <SidebarProvider>
      <Suspense fallback={<DashboardLoading />}>
        <ProductsData />
      </Suspense>
    </SidebarProvider>
  );
}

async function ProductsData() {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, category, price, stock, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const products = (data ?? []) as Product[];

  return (
    <DashboardShell email={user.email ?? ""} title="Products">
      <AddProductForm />
      <Card>
        <CardHeader>
          <CardTitle>
            Products{" "}
            {!error && (
              <span className="text-muted-foreground">({products.length})</span>
            )}
          </CardTitle>
          <CardDescription>
            Your pricelist, stored in Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <SetupNotice message={error.message} table="products" />
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price (₹)</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-24 text-center text-sm text-muted-foreground"
                      >
                        No products yet — add your first one above.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{p.category}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {Number(p.price).toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {p.stock}
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
