"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import OrderView, {
  type Order,
  type OrderItem,
} from "@/components/order-view";
import { createClient } from "@/utils/supabase/client";

export default function OrdersTable({
  orders,
  items,
  addresses,
}: {
  orders: Order[];
  items: OrderItem[];
  addresses: Record<string, string>;
}) {
  const router = useRouter();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [deleting, setDeleting] = React.useState(false);

  const itemsByOrder = React.useMemo(() => {
    const map = new Map<string, OrderItem[]>();
    for (const it of items) {
      const key = String(it.order_id);
      const list = map.get(key) ?? [];
      list.push(it);
      map.set(key, list);
    }
    return map;
  }, [items]);

  const allIds = orders.map((o) => String(o.id));
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
    const ids = Array.from(selected);
    const { data: deletedItems, error: itemsError } = await supabase
      .from("order_items")
      .delete()
      .in("order_id", ids)
      .select("id");
    const { data: deletedOrders, error: ordersError } = itemsError
      ? { data: null, error: itemsError }
      : await supabase.from("orders").delete().in("id", ids).select("id");
    setDeleting(false);
    if (ordersError || !deletedOrders || deletedOrders.length === 0) {
      toast.error("Could not delete orders", {
        description:
          ordersError?.message ??
          "Delete blocked by database permissions — run the delete-policy SQL in Supabase SQL Editor.",
      });
      return;
    }
    void deletedItems;
    toast.success(`${ids.length} order(s) deleted`);
    setSelected(new Set());
    router.refresh();
  }

  if (orders.length === 0) {
    return (
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="h-24 text-center text-sm text-muted-foreground">
                No orders yet — checkouts from the homepage will appear here
                automatically.
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
                  Delete {selected.size} order(s)?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Orders and their items will be removed permanently. This
                  cannot be undone.
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
                  aria-label="Select all orders"
                />
              </TableHead>
              <TableHead className="w-20">Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead className="text-right">Total (₹)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Placed</TableHead>
              <TableHead className="w-16 text-right">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => {
              const orderItems = itemsByOrder.get(String(o.id)) ?? [];
              const qty = orderItems.reduce(
                (n, it) => n + Number(it.qty),
                0
              );
              const checked = selected.has(String(o.id));
              return (
                <TableRow
                  key={o.id}
                  data-state={checked ? "selected" : undefined}
                >
                  <TableCell>
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleOne(o.id)}
                      aria-label={`Select order ${o.id}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium tabular-nums">
                    #{String(o.id)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {o.customer_name}
                  </TableCell>
                  <TableCell className="tabular-nums">{o.phone}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {qty}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums text-amber-600">
                    {Number(o.total).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{o.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {o.created_at
                      ? new Date(o.created_at).toLocaleString("en-IN")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <OrderView
                        order={o}
                        items={orderItems}
                        address={
                          o.customer_id != null
                            ? addresses[String(o.customer_id)]
                            : undefined
                        }
                      />
                    </div>
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
