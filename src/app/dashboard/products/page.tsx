"use client";

import * as React from "react";
import { PackageIcon, TriangleAlertIcon, WalletIcon, TagIcon, ShoppingCartIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";
import AddProductDialog from "@/components/add-product-dialog";
import ProductsTable from "@/components/products-table";
import CategoryBreakdown from "@/components/category-breakdown";
import ReorderSuggestions from "@/components/reorder-suggestions";
import {
  DashboardLoading,
  DashboardShell,
} from "@/components/dashboard-shell";
import SetupNotice from "@/components/setup-notice";
import DashboardStats from "@/components/dashboard-stats";
import { SidebarUser } from "@/components/sidebar-user";
import { listProducts } from "@/lib/store";
import type { Product } from "@/lib/store-data";

export default function Page() {
  const [refreshKey, setRefreshKey] = React.useState(0);
  const refresh = React.useCallback(() => setRefreshKey((k) => k + 1), []);

  return (
    <SidebarProvider>
      <DashboardShell title="Products" userSlot={<SidebarUser />}>
        <div className="flex justify-end">
          <AddProductDialog onChanged={refresh} />
        </div>
        <ProductsData refreshKey={refreshKey} onChanged={refresh} />
      </DashboardShell>
    </SidebarProvider>
  );
}

function ProductsData({
  refreshKey,
  onChanged,
}: {
  refreshKey: number;
  onChanged: () => void;
}) {
  const [products, setProducts] = React.useState<Product[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let live = true;
    setError(null);
    listProducts()
      .then((p) => {
        if (live) setProducts(p);
      })
      .catch((err: unknown) => {
        if (live) setError(err instanceof Error ? err.message : "Failed to load data.");
      });
    return () => {
      live = false;
    };
  }, [refreshKey]);

  if (error) return <SetupNotice message={error} table="products" />;
  if (!products) return <DashboardLoading />;

  const stockValue = products.reduce(
    (sum, p) => sum + Number(p.special_rate) * Number(p.stock),
    0
  );
  const lowStock = products.filter((p) => Number(p.stock) <= 10).length;
  const outOfStock = products.filter((p) => Number(p.stock) === 0).length;

  return (
    <>
      <DashboardStats
        stats={[
          {
            name: "Total Products",
            value: String(products.length),
            description: "Items live in your pricelist.",
            icon: PackageIcon,
          },
          {
            name: "Stock Value",
            value: `₹${stockValue.toLocaleString("en-IN")}`,
            description: "Our rate × stock across products.",
            icon: WalletIcon,
          },
          {
            name: "Low Stock",
            value: String(lowStock),
            description: "Products with stock ≤ 10.",
            icon: TriangleAlertIcon,
          },
          {
            name: "Out of Stock",
            value: String(outOfStock),
            description: "Products with zero stock.",
            icon: ShoppingCartIcon,
          },
        ]}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <CategoryBreakdown products={products} />
        <ReorderSuggestions products={products} />
      </div>
      <Card>
      <CardHeader>
        <CardTitle>
          Products{" "}
          <span className="text-muted-foreground">({products.length})</span>
        </CardTitle>
          <CardDescription>
            Your pricelist, stored in Appwrite.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductsTable products={products} onChanged={onChanged} />
        </CardContent>
      </Card>
    </>
  );
}
