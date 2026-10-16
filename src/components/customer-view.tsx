"use client";

import * as React from "react";
import { EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Customer } from "@/lib/store-data";
import type { Order, OrderItem } from "@/components/order-view";

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg bg-muted/50 px-3 py-2 text-sm">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="text-right">{value?.trim() ? value : "—"}</span>
    </div>
  );
}

export default function CustomerView({
  customer,
  orders,
  items,
}: {
  customer: Customer;
  orders: Order[];
  items: OrderItem[];
}) {
  const [open, setOpen] = React.useState(false);

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

  const total = orders.reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`View ${customer.name}`}
          >
            <EyeIcon className="size-4" aria-hidden="true" />
          </Button>
        }
      />
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{customer.name}</DialogTitle>
          <DialogDescription>
            Customer details
            {customer.created_at
              ? ` · joined ${new Date(customer.created_at).toLocaleString("en-IN")}`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <DetailRow label="Name" value={customer.name} />
          <DetailRow label="Phone" value={customer.phone} />
          <DetailRow label="Address" value={customer.address} />
          <DetailRow label="Pincode" value={customer.pincode} />
          <DetailRow
            label="Submitted"
            value={
              customer.created_at
                ? new Date(customer.created_at).toLocaleString("en-IN")
                : undefined
            }
          />
        </div>
        <div>
          <p className="mb-2 flex items-center justify-between text-sm font-bold">
            <span>Orders</span>
            <span className="tabular-nums text-muted-foreground">
              {orders.length} · ₹{total.toLocaleString("en-IN")}
            </span>
          </p>
          {orders.length === 0 ? (
            <p className="rounded-lg border px-3 py-4 text-center text-sm text-muted-foreground">
              No orders yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {orders.map((o) => {
                const orderItems = itemsByOrder.get(String(o.id)) ?? [];
                return (
                  <div key={o.id} className="rounded-lg border">
                    <div className="flex items-center justify-between gap-3 bg-muted/40 px-3 py-2 text-sm">
                      <span className="font-medium tabular-nums">
                        #{String(o.id)}
                        <span className="ml-2 font-normal text-muted-foreground">
                          {o.created_at
                            ? new Date(o.created_at).toLocaleDateString("en-IN")
                            : ""}
                        </span>
                      </span>
                      <span className="font-semibold tabular-nums">
                        ₹{Number(o.total).toLocaleString("en-IN")}
                      </span>
                    </div>
                    {orderItems.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-14">Item</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">
                              Amount (₹)
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orderItems.map((it) => (
                            <TableRow key={it.id}>
                              <TableCell className="tabular-nums text-muted-foreground">
                                {it.item_no}
                              </TableCell>
                              <TableCell className="font-medium">
                                {it.name}
                              </TableCell>
                              <TableCell className="text-right tabular-nums">
                                {it.qty}
                              </TableCell>
                              <TableCell className="text-right font-semibold tabular-nums">
                                {Number(it.amount).toLocaleString("en-IN")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="px-3 py-2 text-sm text-muted-foreground">
                        No product details recorded for this order.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Close</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
