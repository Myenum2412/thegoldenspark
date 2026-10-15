"use client";

import * as React from "react";
import Image from "next/image";
import { ImageOffIcon, MinusIcon, PlusIcon, ShoppingCartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { productImageSrc, type Product } from "@/lib/store-data";

export default function ProductQuickView({
  product,
  open,
  onOpenChange,
  qty,
  onQtyChange,
}: {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qty: number;
  onQtyChange: (qty: number) => void;
}) {
  const src = productImageSrc(product?.image);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        {product && (
          <>
            <div className="relative flex h-56 w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/40 sm:h-72">
              {src ? (
                <Image
                  src={src}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 512px"
                  className="object-contain p-2"
                />
              ) : (
                <ImageOffIcon
                  className="size-12 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
            </div>
            <DialogHeader>
              <DialogTitle className="text-lg leading-snug">
                {product.name}
              </DialogTitle>
              <DialogDescription>
                Item #{product.item_no}
                {product.category ? ` · ${product.category}` : ""}
              </DialogDescription>
            </DialogHeader>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Packing</dt>
                <dd className="font-medium">{product.packing || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Stock</dt>
                <dd className="font-medium tabular-nums">
                  {Number(product.stock ?? 0) > 0
                    ? Number(product.stock).toLocaleString("en-IN")
                    : "Out of stock"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">MRP (₹)</dt>
                <dd className="font-medium tabular-nums text-muted-foreground line-through">
                  {Number(product.mrp).toLocaleString("en-IN")}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Our Special Rate (₹)</dt>
                <dd className="font-semibold tabular-nums text-amber-600">
                  {Number(product.special_rate).toLocaleString("en-IN")}
                </dd>
              </div>
            </dl>
            <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
              {qty === 0 ? (
                <Button
                  className="w-full bg-amber-500 text-black hover:bg-amber-400"
                  onClick={() => onQtyChange(1)}
                >
                  <ShoppingCartIcon className="size-4" aria-hidden="true" />
                  Add to Cart
                </Button>
              ) : (
                <>
                  <span className="text-sm text-muted-foreground">
                    Quantity
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => onQtyChange(qty - 1)}
                      aria-label={`Remove one ${product.name}`}
                    >
                      <MinusIcon className="size-3.5" aria-hidden="true" />
                    </Button>
                    <span className="w-10 text-center text-sm font-semibold tabular-nums">
                      {qty}
                    </span>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => onQtyChange(qty + 1)}
                      aria-label={`Add one more ${product.name}`}
                    >
                      <PlusIcon className="size-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
