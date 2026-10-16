"use client";

import * as React from "react";
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
import { deleteCustomersWithOrders } from "@/lib/store";
import CustomerView from "@/components/customer-view";
import type { Customer } from "@/lib/store-data";
import type { Order } from "@/components/order-view";

export default function CustomersTable({
  customers,
  stats,
  orders,
  onChanged,
}: {
  customers: Customer[];
  stats: Record<string, { count: number; total: number }>;
  orders: Order[];
  onChanged?: () => void;
}) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [deleting, setDeleting] = React.useState(false);

  const allIds = customers.map((c) => String(c.id));
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
    try {
      await deleteCustomersWithOrders(Array.from(selected));
    } catch (err) {
      setDeleting(false);
      toast.error("Could not delete customers", {
        description: err instanceof Error ? err.message : "Delete failed.",
      });
      return;
    }
    setDeleting(false);
    toast.success(`${selected.size} customer(s) deleted`);
    setSelected(new Set());
    onChanged?.();
  }

  if (customers.length === 0) {
    return (
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="h-24 text-center text-sm text-muted-foreground">
                No customer submissions yet — new form entries will appear
                here automatically.
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
                  Delete {selected.size} customer(s)?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This removes them permanently. This cannot be undone.
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
                  aria-label="Select all customers"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Pincode</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="w-12 text-right">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => {
              const st = stats[String(c.id)];
              const checked = selected.has(String(c.id));
              const customerOrders = orders.filter(
                (o) => o.customer_id != null && String(o.customer_id) === String(c.id)
              );
              return (
                <TableRow
                  key={c.id}
                  data-state={checked ? "selected" : undefined}
                >
                  <TableCell>
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleOne(c.id)}
                      aria-label={`Select ${c.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="max-w-xs">{c.address}</TableCell>
                  <TableCell className="tabular-nums">{c.pincode}</TableCell>
                  <TableCell className="tabular-nums">{c.phone}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {st ? (
                      <>
                        {st.count} · ₹{st.total.toLocaleString("en-IN")}
                      </>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.created_at
                      ? new Date(c.created_at).toLocaleString("en-IN")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <CustomerView customer={c} orders={customerOrders} />
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
