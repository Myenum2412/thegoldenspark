"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  CartSheet,
  CartSheetContent,
  CartSheetTrigger,
} from "@/components/ecomcn/cart-sheet";
import { useCart } from "@/components/shop/cart-provider";
import { FREE_SHIPPING_THRESHOLD, SHOP_CURRENCY, SHOP_LOCALE } from "@/lib/shop-data";

const PHONE_DISPLAY = "+91 8248601417";
const PHONE_TEL = "tel:+918248601417";
const WHATSAPP = "https://wa.me/918248601417";

const NAV = [
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "#categories" },
  { label: "Reviews", href: "#reviews" },
  { label: "Visit us", href: "#visit" },
];

export function SiteHeader() {
  const { lines, setQuantity, remove } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="bg-neutral-950 text-neutral-300">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-2 px-4 py-1.5 text-center text-[11px] tracking-wide sm:text-xs">
          <span className="text-amber-400">★</span>
          Free delivery over{" "}
          <span className="tabular-nums">
            {new Intl.NumberFormat(SHOP_LOCALE, {
              style: "currency",
              currency: SHOP_CURRENCY,
              maximumFractionDigits: 0,
            }).format(FREE_SHIPPING_THRESHOLD)}
          </span>
          <span className="text-neutral-500">·</span> Direct Sivakasi factory rates
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-3 py-3 sm:px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Golden Spark"
            width={44}
            height={44}
            className="h-9 w-9 rounded-md border border-border object-cover"
            priority
          />
          <span className="google-sans text-lg leading-none font-bold tracking-tight">
            Golden{" "}
            <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
              Spark
            </span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-6 text-sm md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
            render={
              <a href="#categories" aria-label="Search">
                <Search aria-hidden className="size-4" />
              </a>
            }
          />
          <Button
            variant="outline"
            size="sm"
            className="hidden border-neutral-700 lg:inline-flex"
            render={
              <a href={PHONE_TEL}>
                <Phone aria-hidden className="size-4" />
                {PHONE_DISPLAY}
              </a>
            }
          />

          <CartSheet
            lines={lines}
            currency={SHOP_CURRENCY}
            locale={SHOP_LOCALE}
            freeShippingThreshold={FREE_SHIPPING_THRESHOLD}
            onQuantityChange={(id, quantity) => setQuantity(id, quantity)}
            onRemove={(id) => remove(id)}
            onCheckout={() => toast("Checkout is the next screen we build.")}
            empty={
              <Link
                href="/shop"
                className="inline-flex h-10 items-center border px-4 text-[13px] tracking-[0.12em] uppercase outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
              >
                Continue shopping
              </Link>
            }
          >
            <CartSheetTrigger className="h-9 rounded-none bg-neutral-950 px-3 text-white hover:bg-neutral-800 hover:text-white focus-visible:ring-2 focus-visible:ring-ring" />
            <CartSheetContent />
          </CartSheet>
        </div>
      </div>
    </header>
  );
}

export { PHONE_DISPLAY, PHONE_TEL, WHATSAPP };
