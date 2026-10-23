"use client";

import * as React from "react";
import { ChevronRightIcon, TrendingUpIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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
import type { Order } from "@/components/order-view";

export default function RecentOrders({
  orders,
  emptyText = "No orders yet.",
}: {
  orders: Order[];
  emptyText?: string;
}) {
  const recent = [...orders]
    .sort(
      (a, b) =>
        new Date(b.created_at ?? b.id).getTime() -
        new Date(a.created_at ?? a.id).getTime()
    )
    .slice(0, 5);

  if (recent.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>No orders placed yet.</CardDescription>
        </CardHeader>
        <CardContent className="h-32 flex items-center justify-center text-muted-foreground">
          {emptyText}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest checkouts from the store.</CardDescription>
        </div>
        <Link
          href="/dashboard/orders"
          className="text-sm font-medium text-muted-foreground hover:text-amber-600 flex items-center gap-1"
        >
          View all <ChevronRightIcon className="size-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="text-sm">
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-muted-foreground">Placed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium tabular-nums">
                    #{o.id}
                  </TableCell>
                  <TableCell className="font-medium">{o.customer_name}</TableCell>
                  <TableCell className="text-right tabular-nums font-semibold text-amber-600">
                    ₹{Number(o.total).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{o.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {o.created_at
                      ? new Date(o.created_at).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
