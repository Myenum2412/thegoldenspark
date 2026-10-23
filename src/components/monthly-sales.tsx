"use client";

import * as React from "react";
import { WalletIcon, BarChart3Icon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Order } from "@/components/order-view";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function MonthlySales({
  orders,
}: {
  orders: Order[];
}) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Sales by month for the current year
  const monthly = new Array(12).fill(0);
  for (const o of orders) {
    if (!o.created_at) continue;
    const d = new Date(o.created_at);
    if (d.getFullYear() !== currentYear) continue;
    monthly[d.getMonth()] += Number(o.total);
  }

  const totalYear = monthly.reduce((a, b) => a + b, 0);
  const max = Math.max(...monthly, 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WalletIcon className="size-4" />
          Monthly Sales — {currentYear}
        </CardTitle>
        <CardDescription>
          Order value by month this year.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-2 h-32">
            {monthly.map((value, i) => {
              const height = Math.max((value / max) * 100, 5);
              const isCurrent = i === currentMonth;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className={`w-full bg-amber-500 rounded-t transition-all duration-500 ${isCurrent ? "bg-amber-400" : ""}`}
                    style={{ height: `${height}%` }}
                    title={`${MONTHS[i]}: ₹${value.toLocaleString("en-IN")}`}
                  />
                  <span className="text-xs text-muted-foreground">
                    {MONTHS[i].slice(0, 3)}
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    ₹{value.toLocaleString("en-IN")}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Total this year:</span>
            <span className="font-semibold tabular-nums text-amber-600">
              ₹{totalYear.toLocaleString("en-IN")}
            </span>
          </div>
          {totalYear === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No sales recorded this year yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
