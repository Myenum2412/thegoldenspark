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
import AddProductForm from "@/components/add-product-form";
import ProductsTable from "@/components/products-table";
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
            icon: PackageIcon,
          },
          {
            name: "Stock Value",
            value: error ? "—" : `₹${stockValue.toLocaleString("en-IN")}`,
            description: "Our rate × stock across products.",
            icon: WalletIcon,
          },
          {
            name: "Low Stock",
            value: error ? "—" : String(lowStock),
            description: "Products with stock ≤ 10.",
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
            <ProductsTable products={products} />
          )}
        </CardContent>
      </Card>
    </>
  );
}