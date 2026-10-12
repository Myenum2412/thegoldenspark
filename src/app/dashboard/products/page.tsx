import { Suspense } from "react";
import { cookies } from "next/headers";
import { PackageIcon, TriangleAlertIcon, WalletIcon } from "lucide-react";
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
import ProductActions from "@/components/product-actions";
import {
  DashboardLoading,
  DashboardShell,
} from "@/components/dashboard-shell";
import SetupNotice from "@/components/setup-notice";
import DashboardStats from "@/components/dashboard-stats";
import { SidebarUser, SidebarUserFallback } from "@/components/sidebar-user";
import { createClient } from "@/utils/supabase/server";
import type { Product } from "@/lib/store-data";

export default function Page() {
  return (
    <SidebarProvider>
      <DashboardShell
        title="Products"
        userSlot={
          <Suspense fallback={<SidebarUserFallback />}>
            <SidebarUser />
          </Suspense>
        }
      >
        <AddProductForm />
        <Suspense fallback={<DashboardLoading />}>
          <ProductsData />
        </Suspense>
      </DashboardShell>
    </SidebarProvider>
  );
}

async function ProductsData() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("products")
    .select("id, item_no, name, category, packing, mrp, special_rate, stock")
    .order("item_no", { ascending: true })
    .limit(200);

  const products = (data ?? []) as Product[];
  const stockValue = products.reduce(
    (sum, p) => sum + Number(p.special_rate) * Number(p.stock),
    0
  );
  const lowStock = products.filter((p) => Number(p.stock) <= 10).length;

  return (
    <>
      <DashboardStats
        stats={[
          {
            name: "Total Products",
            value: error ? "—" : String(products.length),
            description: "Items live in your pricelist.",
            href: "/dashboard/products",
            linkLabel: "View all",
            icon: PackageIcon,
          },
          {
            name: "Stock Value",
            value: error ? "—" : `₹${stockValue.toLocaleString("en-IN")}`,
            description: "Our rate × stock across products.",
            href: "/dashboard/reports",
            linkLabel: "View reports",
            icon: WalletIcon,
          },
          {
            name: "Low Stock",
            value: error ? "—" : String(lowStock),
            description: "Products with stock ≤ 10.",
            href: "/dashboard/reports",
            linkLabel: "View reports",
            icon: TriangleAlertIcon,
          },
        ]}
      />
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
                    <TableHead className="w-16">Item</TableHead>
                    <TableHead>Variety / Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Packing</TableHead>
                    <TableHead className="text-right">MRP (₹)</TableHead>
                    <TableHead className="text-right">Our Rate (₹)</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="h-24 text-center text-sm text-muted-foreground"
                      >
                        No products yet — run supabase/seed.sql to load the
                        pricelist, or add one above.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="tabular-nums">
                          {p.item_no}
                        </TableCell>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {p.category}
                        </TableCell>
                        <TableCell>{p.packing}</TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {Number(p.mrp).toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums text-amber-600">
                          {Number(p.special_rate).toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {Number(p.stock).toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell>
                          <ProductActions product={p} />
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