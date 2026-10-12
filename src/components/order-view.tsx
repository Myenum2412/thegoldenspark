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

export type Order = {
  id: string | number;
  customer_id: number | null;
  customer_name: string;
  phone: string;
  total: number;
  status: string;
  created_at?: string;
};

export type OrderItem = {
  id: string | number;
  order_id: string | number;
  item_no: number;
  name: string;
  qty: number;
  rate: number;
  amount: number;
};

export default function OrderView({
  order,
  items,
  address,
}: {
  order: Order;
  items: OrderItem[];
  address?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`View order #${order.id}`}
          >
            <EyeIcon className="size-4" aria-hidden="true" />
          </Button>
        }
      />
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Order #{String(order.id)}</DialogTitle>
          <DialogDescription>
            {order.customer_name} · {order.phone}
            {order.created_at
              ? ` · ${new Date(order.created_at).toLocaleString("en-IN")}`
              : ""}
          </DialogDescription>
        </DialogHeader>
        {address && (
          <p className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
            <span className="font-medium">Full Address: </span>
            {address}
          </p>
        )}
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Item</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Rate (₹)</TableHead>
                <TableHead className="text-right">Amount (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {it.item_no}
                  </TableCell>
                  <TableCell className="font-medium">{it.name}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {it.qty}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {Number(it.rate).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {Number(it.amount).toLocaleString("en-IN")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="flex items-center justify-between text-sm font-bold">
          <span>Total Amount</span>
          <span className="tabular-nums">
            ₹{Number(order.total).toLocaleString("en-IN")}
          </span>
        </p>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Close</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
