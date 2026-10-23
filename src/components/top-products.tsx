"use client";

import * as React from "react";
import { TrophyIcon, PackageIcon } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Product } from "@/lib/store-data";
import type { OrderItem } from "@/components/order-view";

export default function TopProducts({
  products,
  items,
}: {
  products: Product[];
  items: OrderItem[];
}) {
  const soldByProduct = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const it of items) {
    const cur = soldByProduct.get(String(it.order_id)) ?? { name: it.name, qty: 0, revenue: 0 };
    cur.qty += Number(it.qty);
    cur.revenue += Number(it.amount);
    soldByProduct.set(String(it.order_id), cur);
  }

  // Use product name as key since items reference by name
  const byName = new Map<string, { qty: number; revenue: number }>();
  for (const it of items) {
    const cur = byName.get(it.name) ?? { qty: 0, revenue: 0 };
    cur.qty += Number(it.qty);
    cur.revenue += Number(it.amount);
    byName.set(it.name, cur);
  }

  const top = Array.from(byName.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <TrophyIcon className="size-4 text-amber-500" />
          <div>
            <CardTitle className="text-sm">Top Selling Products</CardTitle>
            <CardDescription>
              By quantity sold across all orders.
            </CardDescription>
          </div>
        </div>
        <Link
          href="/dashboard/products"
          className="text-xs font-medium text-muted-foreground hover:text-amber-600 flex items-center gap-1"
        >
          Manage products <PackageIcon className="size-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {top.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No sales data yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Qty Sold</TableHead>
                  <TableHead className="text-right">Revenue (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {top.map((p, i) => (
                  <TableRow key={p.name}>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {i + 1}
                    </TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-right tabular-nums font-semibold">
                      {p.qty}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-amber-600">
                      {p.revenue.toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
