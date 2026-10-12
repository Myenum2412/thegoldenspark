"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ProductActions from "@/components/product-actions";
import { createClient } from "@/utils/supabase/client";
import type { Product } from "@/lib/store-data";

export default function ProductsTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [deleting, setDeleting] = React.useState(false);

  const allIds = products.map((p) => String(p.id));
  const allSelected = allIds.length > 0 && selected.size === allIds.length;
  const someSelected = selected.size > 0 && !allSelected;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(allIds));
  }

  function toggleOne(id: string | number) {
    const key = String(id);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleDeleteSelected() {
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("products")
      .delete()
      .in("id", Array.from(selected));
    setDeleting(false);
    if (error) {
      toast.error("Could not delete products", {
        description: error.message,
      });
      return;
    }
    toast.success(`${selected.size} product(s) deleted`);
    setSelected(new Set());
    router.refresh();
  }

  if (products.length === 0) {
    return (
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="h-24 text-center text-sm text-muted-foreground">
                No products yet — run supabase/seed.sql to load the pricelist,
                or add one above.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {selected.size > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-2.5">
          <span className="text-sm font-medium tabular-nums">
            {selected.size} selected
          </span>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2Icon className="size-3.5" aria-hidden="true" />
                  Delete selected
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete {selected.size} product(s)?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This removes them from the pricelist permanently. This cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteSelected}
                  disabled={deleting}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  {deleting ? "Deleting…" : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all products"
                />
              </TableHead>
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
            {products.map((p) => {
              const checked = selected.has(String(p.id));
              return (
                <TableRow
                  key={p.id}
                  data-state={checked ? "selected" : undefined}
                >
                  <TableCell>
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleOne(p.id)}
                      aria-label={`Select ${p.name}`}
                    />
                  </TableCell>
                  <TableCell className="tabular-nums">{p.item_no}</TableCell>
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
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
