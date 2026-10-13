"use client";

import * as React from "react";
import {
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  Trash2Icon,
} from "lucide-react";
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
import CheckoutDialog from "@/components/checkout-dialog";
import type { Product } from "@/lib/store-data";

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
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const [customer, setCustomer] = React.useState({
    name: "",
    phone: "",
    address: "",
    pincode: "",
  });

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

  const listEmpty = products.length === 0;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Heading + customer details panel ───────── */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-neutral-950 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_15%_0%,rgba(245,158,11,0.25),transparent),radial-gradient(ellipse_40%_50%_at_90%_100%,rgba(234,88,12,0.2),transparent)]"
        />
        <div className="relative grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
          <div className="flex flex-col justify-center">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-amber-400 uppercase">
              <ShoppingCartIcon className="size-4" aria-hidden="true" />
              Shop
            </p>
            <h2 className="google-sans mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Our Products
            </h2>
            <p className="mt-2 max-w-sm text-sm text-neutral-400">
              2026 pricelist at 80% off MRP — fill your details, add to
              cart, and order in one go.
            </p>
          </div>
          <div className="grid content-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5">
            <p className="text-xs font-semibold tracking-widest text-amber-400 uppercase">
              Your Details
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label htmlFor="top-name" className="text-xs font-medium text-neutral-300">
                  Full Name *
                </label>
                <Input
                  id="top-name"
                  placeholder="Enter your name"
                  value={customer.name}
                  onChange={(e) =>
                    setCustomer((c) => ({ ...c, name: e.target.value }))
                  }
                  maxLength={80}
                  className="border-white/20 bg-white text-black placeholder:text-neutral-400"
                />
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="top-phone" className="text-xs font-medium text-neutral-300">
                  Mobile Number *
                </label>
                <Input
                  id="top-phone"
                  inputMode="numeric"
                  placeholder="10-digit mobile"
                  value={customer.phone}
                  onChange={(e) =>
                    setCustomer((c) => ({
                      ...c,
                      phone: e.target.value.replace(/[^0-9+ ]/g, ""),
                    }))
                  }
                  maxLength={14}
                  className="border-white/20 bg-white text-black placeholder:text-neutral-400"
                />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <label htmlFor="top-address" className="text-xs font-medium text-neutral-300">
                  Full Address *
                </label>
                <Input
                  id="top-address"
                  placeholder="Door no, street, area, city"
                  value={customer.address}
                  onChange={(e) =>
                    setCustomer((c) => ({ ...c, address: e.target.value }))
                  }
                  maxLength={300}
                  className="border-white/20 bg-white text-black placeholder:text-neutral-400"
                />
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="top-pincode" className="text-xs font-medium text-neutral-300">
                  Pincode *
                </label>
                <Input
                  id="top-pincode"
                  inputMode="numeric"
                  placeholder="e.g. 636005"
                  value={customer.pincode}
                  onChange={(e) =>
                    setCustomer((c) => ({
                      ...c,
                      pincode: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                  maxLength={6}
                  className="border-white/20 bg-white text-black placeholder:text-neutral-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center gap-2 p-4">
          <div className="flex w-full flex-col items-center gap-2">
            <Input
              type="search"
              placeholder="Search crackers…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
              className="w-full max-w-md text-center"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by category"
              className="h-9 w-full max-w-md rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "All items" : c}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {listEmpty ? (
        <Card>
          <CardHeader>
            <CardTitle>Pricelist 2026</CardTitle>
            <CardDescription>
              Our cracker pricelist is being updated — please call or WhatsApp
              us for today&apos;s rates.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <Card className="hidden sm:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">S.No</TableHead>
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
                  filtered.map((p, index) => {
                    const qty = cart[String(p.id)] ?? 0;
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="tabular-nums text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{p.name}</p>
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
          filtered.map((p, index) => {
            const qty = cart[String(p.id)] ?? 0;
            return (
              <Card key={p.id} className="gap-0 py-0">
                <CardContent className="flex items-center gap-3 p-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-xs font-bold text-amber-600 tabular-nums">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
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
        </>
      )}

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
                onClick={() => setCheckoutOpen(true)}
              >
                <ShoppingCartIcon className="size-4" aria-hidden="true" />
                Checkout
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        lines={lines}
        total={total}
        initialCustomer={customer}
        onSaved={() => setCart({})}
      />
    </div>
  );
}
