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
import type { Order } from "@/components/order-view";

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
}: {
  customer: Customer;
  orders: Order[];
}) {
  const [open, setOpen] = React.useState(false);

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
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium tabular-nums">
                        #{String(o.id)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {o.created_at
                          ? new Date(o.created_at).toLocaleDateString("en-IN")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {Number(o.total).toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
