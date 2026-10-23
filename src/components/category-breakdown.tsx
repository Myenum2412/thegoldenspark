"use client";

import * as React from "react";
import { TagIcon, PackageIcon } from "lucide-react";
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

export default function CategoryBreakdown({
  products,
}: {
  products: Product[];
}) {
  const byCategory = new Map<
    string,
    { count: number; stock: number; value: number }
  >();
  for (const p of products) {
    const cat = p.category || "General";
    const cur = byCategory.get(cat) ?? { count: 0, stock: 0, value: 0 };
    cur.count += 1;
    cur.stock += Number(p.stock);
    cur.value += Number(p.special_rate) * Number(p.stock);
    byCategory.set(cat, cur);
  }

  const rows = Array.from(byCategory.entries()).map(([category, data]) => ({
    category,
    ...data,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TagIcon className="size-4" />
          Product Categories
        </CardTitle>
        <CardDescription>
          Breakdown of products by category with stock and value.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="text-sm">
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Products</TableHead>
                <TableHead className="text-right">Stock Units</TableHead>
                <TableHead className="text-right">Stock Value (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.category}>
                  <TableCell className="font-medium">{r.category}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.count}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.stock}</TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">
                    {r.value.toLocaleString("en-IN")}
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No products yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {rows.length > 0 && (
          <div className="mt-3 flex justify-end">
            <PackageIcon className="size-4 text-muted-foreground" aria-hidden="true" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
