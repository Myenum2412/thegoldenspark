"use client";

import * as React from "react";
import { TriangleAlertIcon, ShoppingCartIcon } from "lucide-react";
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

export default function LowStockAlert({
  products,
  threshold = 10,
}: {
  products: Product[];
  threshold?: number;
}) {
  const low = products
    .filter((p) => Number(p.stock) <= threshold)
    .sort((a, b) => Number(a.stock) - Number(b.stock))
    .slice(0, 5);

  return (
    <Card className={low.length === 0 ? "border-green-500/30 bg-green-500/5" : "border-amber-500/30 bg-amber-500/5"}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          {low.length > 0 ? (
            <TriangleAlertIcon className="size-4 text-amber-600" />
          ) : (
            <ShoppingCartIcon className="size-4 text-green-600" />
          )}
          <div>
            <CardTitle className="text-sm">
              {low.length > 0 ? "Low Stock Alert" : "Stock Levels OK"}
            </CardTitle>
            <CardDescription>
              {low.length > 0
                ? `${low.length} product(s) at or below ${threshold} units.`
                : "All products are above the reorder threshold."}
            </CardDescription>
          </div>
        </div>
        {low.length > 0 && (
          <Link
            href="/dashboard/products"
            className="text-xs font-medium text-muted-foreground hover:text-amber-600 flex items-center gap-1"
          >
            Manage stock
          </Link>
        )}
      </CardHeader>
      {low.length > 0 ? (
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="text-xs">
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Rate (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {low.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium text-destructive">
                      {p.stock}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {Number(p.special_rate).toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      ) : (
        <CardContent className="h-24 flex items-center justify-center text-sm text-green-600">
          All products are well stocked — no reorder needed.
        </CardContent>
      )}
    </Card>
  );
}
