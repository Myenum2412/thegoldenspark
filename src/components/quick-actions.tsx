"use client";

import * as React from "react";
import {
  PlusIcon,
  UsersIcon,
  PackageIcon,
  ClipboardListIcon,
  ChartColumnIcon,
  FileTextIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type QuickAction = {
  title: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  badge?: string;
};

const actions: QuickAction[] = [
  {
    title: "Add Product",
    description: "Add a new item to your pricelist.",
    url: "/dashboard/products",
    icon: <PlusIcon className="size-4" />,
  },
  {
    title: "View Customers",
    description: "See all customer details and order history.",
    url: "/dashboard/customers",
    icon: <UsersIcon className="size-4" />,
  },
  {
    title: "Manage Products",
    description: "Update stock, prices, and product details.",
    url: "/dashboard/products",
    icon: <PackageIcon className="size-4" />,
  },
  {
    title: "View Orders",
    description: "Review all checkouts and generate bills.",
    url: "/dashboard/orders",
    icon: <ClipboardListIcon className="size-4" />,
  },
  {
    title: "Reports",
    description: "Sales trends, top products, and insights.",
    url: "/dashboard/reports",
    icon: <ChartColumnIcon className="size-4" />,
  },
  {
    title: "Print Bill",
    description: "Generate a printable invoice for an order.",
    url: "/dashboard/orders",
    icon: <FileTextIcon className="size-4" />,
  },
];

export default function QuickActions() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {actions.map((action) => (
        <Card key={action.title} className="border-0 hover:shadow-sm transition-shadow cursor-pointer group">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 group-hover:bg-amber-500/20 transition-colors">
              {action.icon}
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{action.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {action.description}
              </p>
            </div>
            <Link
              href={action.url}
              className="text-xs font-medium text-amber-600 hover:text-amber-700"
            >
              Go →
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
