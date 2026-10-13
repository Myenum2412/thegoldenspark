"use client";

import { ArrowLeftIcon, PrinterIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BillToolbar() {
  return (
    <div className="flex items-center justify-between gap-3 print:hidden">
      <Link href="/dashboard/orders">
        <Button variant="outline" size="sm">
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          Back to Orders
        </Button>
      </Link>
      <Button
        size="sm"
        className="bg-amber-500 text-black hover:bg-amber-400"
        onClick={() => window.print()}
      >
        <PrinterIcon className="size-4" aria-hidden="true" />
        Print / Save as PDF
      </Button>
    </div>
  );
}