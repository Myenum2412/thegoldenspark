"use client";

import * as React from "react";
import { ShoppingCartIcon, ArrowUpIcon } from "lucide-react";
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

export default function ReorderSuggestions({
  products,
  threshold = 20,
}: {
  products: Product[];
  threshold?: number;
}) {
  const needsReorder = products
    .filter((p) => Number(p.stock) <= threshold)
    .sort((a, b) => Number(a.stock) - Number(b.stock))
    .slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <ShoppingCartIcon className="size-4 text-amber-600" />
          <div>
            <CardTitle className="text-sm">Reorder Suggestions</CardTitle>
            <CardDescription>
              Products at or below {threshold} units worth restocking.
            </CardDescription>
          </div>
        </div>
        <Link
          href="/dashboard/products"
          className="text-xs font-medium text-muted-foreground hover:text-amber-600 flex items-center gap-1"
        >
          Manage products <ArrowUpIcon className="size-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {needsReorder.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No products need restocking right now.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Rate (₹)</TableHead>
                  <TableHead className="text-right">Est. Reorder Cost (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {needsReorder.map((p) => {
                  const suggestedQty = Math.max(threshold - Number(p.stock), 10);
                  const estCost = suggestedQty * Number(p.special_rate);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-right tabular-nums font-medium text-destructive">
                        {p.stock}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {Number(p.special_rate).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-semibold">
                        {estCost.toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
