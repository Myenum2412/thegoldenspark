"use client";

import * as React from "react";
import {
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  Trash2Icon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WhatsappIcon } from "@/components/ui/svgs/whatsappIcon";
import type { Product } from "@/lib/store-data";

const WHATSAPP = "https://wa.me/918248601417";
const CART_KEY = "gsh-cart";

function loadCart(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(CART_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export default function PricelistTable({
  products,
}: {
  products: Product[];
}) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("All");
  const [cart, setCart] = React.useState<Record<string, number>>(loadCart);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      // storage unavailable — cart just won't persist
    }
  }, [cart]);

  const categories = React.useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );

  const filtered = products.filter((p) => {
    const q = query.trim().toLowerCase();
    const matchesQ =
      q.length === 0 ||
      p.name.toLowerCase().includes(q) ||
      String(p.item_no).includes(q);
    const matchesC = category === "All" || p.category === category;
    return matchesQ && matchesC;
  });

  const byId = React.useMemo(
    () => new Map(products.map((p) => [String(p.id), p])),
    [products]
  );
  const lines = Object.entries(cart)
    .map(([id, qty]) => ({ product: byId.get(id), qty }))
    .filter((l) => l.product && l.qty > 0) as {
    product: Product;
    qty: number;
  }[];
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const total = lines.reduce(
    (sum, l) => sum + Number(l.product.special_rate) * l.qty,
    0
  );

  function setQty(id: string | number, qty: number) {
    const key = String(id);
    setCart((prev) => {
      if (qty <= 0) {
        const { [key]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: qty };
    });
  }

  function orderOnWhatsApp() {
    const orderLines = lines.map(
      (l) =>
        `${l.qty} x ${l.product.name} - ₹${(
          Number(l.product.special_rate) * l.qty
        ).toLocaleString("en-IN")}`
    );
    const text = [
      "Vanakkam Golden Spark! I want to order:",
      "",
      ...orderLines,
      "",
      `Total: ₹${total.toLocaleString("en-IN")}`,
      "",
      "Name:",
      "Address:",
    ].join("\n");
    window.open(`${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank");
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pricelist 2026</CardTitle>
          <CardDescription>
            Our cracker pricelist is being updated — please call or WhatsApp
            us for today&apos;s rates.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <Badge
          variant="secondary"
          className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300"
        >
          <ShoppingCartIcon className="size-3.5" aria-hidden="true" />
          Shop
        </Badge>
        <h2 className="google-sans mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          Pricelist 2026
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          80% discount on MRP — add items to your cart and order on WhatsApp.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="search"
          placeholder="Search crackers… (name or item no.)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search products"
          className="sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <Button
              key={c}
              variant={category === c ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(c)}
              className={
                category === c ? "bg-amber-500 text-black hover:bg-amber-400" : ""
              }
            >
              {c}
            </Button>
          ))}
        </div>
      </div>

      <Card className="hidden sm:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14">Item</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">MRP (₹)</TableHead>
                  <TableHead className="text-right">Our Price (₹)</TableHead>
                  <TableHead className="w-36 text-right">Add to Cart</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-sm text-muted-foreground"
                    >
                      No products match your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((p) => {
                    const qty = cart[String(p.id)] ?? 0;
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="tabular-nums text-muted-foreground">
                          {p.item_no}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.packing} · {p.category}
                          </p>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground line-through">
                          {Number(p.mrp).toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums text-amber-600">
                          {Number(p.special_rate).toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell>
                          {qty === 0 ? (
                            <div className="flex justify-end">
                              <Button
                                size="sm"
                                className="bg-amber-500 text-black hover:bg-amber-400"
                                onClick={() => setQty(p.id, 1)}
                                aria-label={`Add ${p.name} to cart`}
                              >
                                <ShoppingCartIcon
                                  className="size-4"
                                  aria-hidden="true"
                                />
                                Add
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="outline"
                                size="icon-sm"
                                onClick={() => setQty(p.id, qty - 1)}
                                aria-label={`Remove one ${p.name}`}
                              >
                                <MinusIcon
                                  className="size-3.5"
                                  aria-hidden="true"
                                />
                              </Button>
                              <span className="w-8 text-center text-sm font-semibold tabular-nums">
                                {qty}
                              </span>
                              <Button
                                variant="outline"
                                size="icon-sm"
                                onClick={() => setQty(p.id, qty + 1)}
                                aria-label={`Add one more ${p.name}`}
                              >
                                <PlusIcon
                                  className="size-3.5"
                                  aria-hidden="true"
                                />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Mobile: full-width stacked cards ─────────── */}
      <div className="flex flex-col gap-2 sm:hidden">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No products match your search.
            </CardContent>
          </Card>
        ) : (
          filtered.map((p) => {
            const qty = cart[String(p.id)] ?? 0;
            return (
              <Card key={p.id} className="gap-0 py-0">
                <CardContent className="flex items-center gap-3 p-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-xs font-bold text-amber-600 tabular-nums">
                    {p.item_no}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.packing} ·{" "}
                      <span className="line-through">
                        ₹{Number(p.mrp).toLocaleString("en-IN")}
                      </span>{" "}
                      <span className="font-semibold text-amber-600">
                        ₹{Number(p.special_rate).toLocaleString("en-IN")}
                      </span>
                    </p>
                  </div>
                  {qty === 0 ? (
                    <Button
                      size="icon"
                      className="shrink-0 bg-amber-500 text-black hover:bg-amber-400"
                      onClick={() => setQty(p.id, 1)}
                      aria-label={`Add ${p.name} to cart`}
                    >
                      <ShoppingCartIcon
                        className="size-4"
                        aria-hidden="true"
                      />
                    </Button>
                  ) : (
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => setQty(p.id, qty - 1)}
                        aria-label={`Remove one ${p.name}`}
                      >
                        <MinusIcon className="size-3.5" aria-hidden="true" />
                      </Button>
                      <span className="w-6 text-center text-sm font-semibold tabular-nums">
                        {qty}
                      </span>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => setQty(p.id, qty + 1)}
                        aria-label={`Add one more ${p.name}`}
                      >
                        <PlusIcon className="size-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {count > 0 && (
        <Card className="sticky bottom-4 border-amber-500/40 shadow-lg">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <ShoppingCartIcon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">
                  {count} item{count === 1 ? "" : "s"} · ₹
                  {total.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {lines.length} product{lines.length === 1 ? "" : "s"} in cart
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCart({})}
                aria-label="Clear cart"
              >
                <Trash2Icon className="size-4" aria-hidden="true" />
                Clear
              </Button>
              <Button
                size="sm"
                className="bg-amber-500 text-black hover:bg-amber-400"
                onClick={orderOnWhatsApp}
              >
                <WhatsappIcon className="size-4" aria-hidden="true" />
                Order on WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
