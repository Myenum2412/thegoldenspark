"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Factory, MapPin, Phone, ShieldCheck, Store, Truck } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WhatsappIcon } from "@/components/ui/svgs/whatsappIcon";
import {
  ProductCard,
  ProductCardBody,
  ProductCardCorner,
  ProductCardBadge,
  ProductCardImage,
  ProductCardMedia,
  ProductCardQuickAdd,
  ProductCardWishlist,
  type ProductCardProduct,
} from "@/components/ecomcn/product-card";
import { ProductGrid } from "@/components/ecomcn/product-grid";
import {
  ProductQuickView,
  ProductQuickViewImage,
  ProductQuickViewTrigger,
} from "@/components/ecomcn/product-quick-view";
import { RelatedProducts } from "@/components/ecomcn/related-products";
import { ReviewSummary } from "@/components/ecomcn/review-summary";
import { SortToolbar, DEFAULT_SORT_OPTIONS } from "@/components/ecomcn/sort-toolbar";
import { CartProvider, toCardProduct, useCart } from "@/components/shop/cart-provider";
import { ProductArt } from "@/components/shop/product-art";
import { SiteFooter } from "@/components/shop/site-footer";
import { SiteHeader } from "@/components/shop/site-header";
import {
  FREE_SHIPPING_THRESHOLD,
  SHOP_CATEGORIES,
  SHOP_CURRENCY,
  SHOP_LOCALE,
  SHOP_PRODUCTS,
  SHOP_REVIEW_DISTRIBUTION,
  SHOP_REVIEWS,
  sortShopProducts,
  type ShopSort,
} from "@/lib/shop-data";

const PHONE_DISPLAY = "+91 8248601417";
const PHONE_TEL = "tel:+918248601417";
const WHATSAPP = "https://wa.me/918248601417";

const money = (amount: number) =>
  new Intl.NumberFormat(SHOP_LOCALE, {
    style: "currency",
    currency: SHOP_CURRENCY,
    maximumFractionDigits: 0,
  }).format(amount);

const TRUST = [
  { icon: Factory, title: "Direct factory rates", note: "No middleman markup" },
  { icon: Truck, title: "Same-day dispatch", note: `Free over ${money(FREE_SHIPPING_THRESHOLD)}` },
  { icon: ShieldCheck, title: "Safe & certified", note: "Moisture-proof packing" },
  { icon: Store, title: "Wholesale welcome", note: "Bulk pricing on call" },
];

export function StorefrontHome() {
  return (
    <CartProvider>
      <Toaster />
      <SiteHeader />
      <main className="min-h-screen bg-background">
        <Hero />
        <TrustStrip />
        <CategoryRail />
        <FeaturedProducts />
        <RelatedRail />
        <Reviews />
        <VisitSection />
      </main>
      <SiteFooter />
    </CartProvider>
  );
}

/* ─── hero ───────────────────────────────────────────────────────────────── */

function Hero() {
  const { add } = useCart();
  return (
    <section className="relative overflow-hidden bg-neutral-950 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(245,158,11,0.35),transparent),radial-gradient(ellipse_40%_35%_at_85%_110%,rgba(234,88,12,0.25),transparent),radial-gradient(ellipse_40%_35%_at_10%_110%,rgba(245,158,11,0.15),transparent)]"
      />
      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="flex flex-col items-start">
          <Badge
            variant="secondary"
            className="border-amber-500/30 bg-amber-500/10 text-amber-300"
          >
            Diwali 2026 collection is live
          </Badge>
          <h1 className="google-sans mt-5 text-4xl leading-[1.05] font-bold tracking-tight sm:text-6xl">
            Every Spark has a
            <span className="block bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
              Story
            </span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-neutral-400 sm:text-lg">
            Premium Sivakasi crackers at direct factory rates — rockets, aerial
            shots, fountains and family combos, delivered across Tamil Nadu.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-12 bg-amber-500 px-6 text-black hover:bg-amber-400"
              render={
                <a href="#featured">
                  Shop the range
                  <ArrowRight aria-hidden />
                </a>
              }
            />
            <Button
              size="lg"
              variant="outline"
              className="h-12 border-neutral-700 bg-transparent px-6 text-white hover:bg-neutral-800 hover:text-white"
              render={
                <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
                  <WhatsappIcon className="size-4" aria-hidden />
                  WhatsApp your list
                </a>
              }
            />
          </div>
          <button
            type="button"
            onClick={() =>
              add({
                id: "gs-112",
                name: "Family Mega Combo",
                href: "/product/family-mega-combo",
                price: 2499,
                compareAt: 3499,
                colors: [{ name: "Gold", hex: "#f59e0b" }],
              })
            }
            className="mt-5 text-sm text-neutral-400 underline decoration-neutral-700 underline-offset-4 outline-none hover:text-amber-300 focus-visible:text-amber-300"
          >
            Or quick-add our best-selling Family Mega Combo — {money(2499)}
          </button>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="grid grid-cols-2 gap-3">
            {[11, 53, 97, 113].map((seed, i) => (
              <div
                key={seed}
                className={
                  "relative overflow-hidden rounded-xl border border-white/10 " +
                  (i % 3 === 0 ? "aspect-[4/5]" : "aspect-square")
                }
              >
                <ProductArt seed={seed} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── trust strip ────────────────────────────────────────────────────────── */

function TrustStrip() {
  return (
    <section className="border-b">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-x-6 gap-y-6 px-4 py-8 lg:grid-cols-4">
        {TRUST.map((item) => (
          <div key={item.title} className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary text-foreground">
              <item.icon aria-hidden className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.note}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── category rail ──────────────────────────────────────────────────────── */

function CategoryRail() {
  return (
    <section id="categories" className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-12 sm:py-16">
      <div className="flex items-end justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl">Shop by category</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Six families of crackers, from the first sparkler to the finale.
          </p>
        </div>
        <Link
          href="/shop"
          className="hidden shrink-0 items-center gap-1.5 text-sm underline-offset-4 outline-none hover:underline focus-visible:underline sm:inline-flex"
        >
          View all <ArrowRight aria-hidden className="size-3.5" />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {SHOP_CATEGORIES.map((category, i) => (
          <Link
            key={category.id}
            href="/shop"
            className="group relative flex h-40 flex-col justify-end overflow-hidden rounded-xl border p-4 outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-48"
          >
            <div className="absolute inset-0 opacity-70 transition-opacity group-hover:opacity-100">
              <ProductArt seed={category.id.length * 37 + i * 11} />
            </div>
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
            />
            <div className="relative">
              <p className="text-base font-medium text-white">{category.label}</p>
              <p className="mt-0.5 text-xs text-neutral-300">{category.blurb}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ─── featured grid ──────────────────────────────────────────────────────── */

const SORT_VALUES: ShopSort[] = ["featured", "newest", "price-asc", "price-desc", "rating"];

function FeaturedProducts() {
  const { add } = useCart();
  const [sort, setSort] = React.useState<ShopSort>("featured");
  const [density, setDensity] = React.useState<"comfortable" | "compact">("comfortable");
  const [saved, setSaved] = React.useState<ReadonlySet<string>>(new Set());

  const products = React.useMemo<ProductCardProduct[]>(
    () => sortShopProducts(SHOP_PRODUCTS, sort).map(toCardProduct),
    [sort],
  );

  const toggleWishlist = React.useCallback((next: boolean, product: ProductCardProduct) => {
    setSaved((current) => {
      const nextSet = new Set(current);
      if (next) nextSet.add(product.id);
      else nextSet.delete(product.id);
      return nextSet;
    });
  }, []);

  return (
    <section id="featured" className="scroll-mt-24 border-t bg-secondary/20">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl">The full range</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {SHOP_PRODUCTS.length} products, all at direct factory rates. Hover a
            card for a quick view, or add straight to your bag.
          </p>
        </div>

        <ProductQuickView
          currency={SHOP_CURRENCY}
          locale={SHOP_LOCALE}
          onAddToBag={(product, colorIndex) => add(product, colorIndex)}
        >
          <SortToolbar
            className="mt-8"
            total={products.length}
            sort={sort}
            onSortChange={(value) => setSort(value as ShopSort)}
            sortOptions={DEFAULT_SORT_OPTIONS.filter((option) =>
              SORT_VALUES.includes(option.value as ShopSort),
            )}
            density={density}
            onDensityChange={setDensity}
            locale={SHOP_LOCALE}
          />

          <ProductGrid
            className="mt-8"
            products={products}
            density={density}
            currency={SHOP_CURRENCY}
            locale={SHOP_LOCALE}
            onQuickAdd={(product, colorIndex) => add(product, colorIndex)}
            renderCard={(product) => (
              <ProductCard
                key={product.id}
                product={product}
                density={density}
                currency={SHOP_CURRENCY}
                locale={SHOP_LOCALE}
                onQuickAdd={(p, colorIndex) => add(p, colorIndex)}
                wishlisted={saved.has(product.id)}
                onWishlistChange={toggleWishlist}
              >
                <ProductCardMedia>
                  <ProductQuickViewImage product={product}>
                    <ProductCardImage />
                  </ProductQuickViewImage>
                  <ProductCardCorner>
                    <ProductCardBadge />
                    <ProductCardWishlist />
                  </ProductCardCorner>
                  <ProductQuickViewTrigger product={product} />
                  <ProductCardQuickAdd />
                </ProductCardMedia>
                <ProductCardBody />
              </ProductCard>
            )}
          />
        </ProductQuickView>
      </div>
    </section>
  );
}

/* ─── related rail ───────────────────────────────────────────────────────── */

function RelatedRail() {
  const { add } = useCart();
  const products = React.useMemo(
    () =>
      [...SHOP_PRODUCTS]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6)
        .map(toCardProduct),
    [],
  );

  return (
    <section className="border-t">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
        <RelatedProducts
          title="Top rated this season"
          products={products}
          currency={SHOP_CURRENCY}
          locale={SHOP_LOCALE}
          onQuickAdd={(product, colorIndex) => add(product, colorIndex)}
        />
      </div>
    </section>
  );
}

/* ─── reviews ────────────────────────────────────────────────────────────── */

function Reviews() {
  return (
    <section id="reviews" className="scroll-mt-24 border-t bg-secondary/20">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
        <ReviewSummary
          reviews={SHOP_REVIEWS}
          distribution={SHOP_REVIEW_DISTRIBUTION}
          locale={SHOP_LOCALE}
          title="What our customers say"
          pageSize={4}
        />
      </div>
    </section>
  );
}

/* ─── visit ──────────────────────────────────────────────────────────────── */

function VisitSection() {
  return (
    <section id="visit" className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-12 sm:py-16">
      <div className="text-center">
        <Badge
          variant="secondary"
          className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300"
        >
          <MapPin aria-hidden className="size-3.5" /> Find us
        </Badge>
        <h2 className="google-sans mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          Visit our store
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Walk in or reach out — we love talking fireworks.
        </p>
      </div>

      <div className="relative mt-8 overflow-hidden rounded-2xl border bg-neutral-950 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_15%_0%,rgba(245,158,11,0.25),transparent),radial-gradient(ellipse_40%_50%_at_90%_100%,rgba(234,88,12,0.2),transparent)]"
        />
        <div className="relative grid gap-6 p-6 sm:grid-cols-5 sm:p-10">
          <div className="sm:col-span-3">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-amber-400 uppercase">
              <MapPin aria-hidden className="size-4" /> Our address
            </p>
            <address className="google-sans mt-3 text-xl leading-relaxed font-medium text-white not-italic sm:text-2xl">
              Golden Spark Pvt Ltd, Opp. To Agarwal Eye Hospital, 5 Roads, Salem,
              Tamil Nadu.
            </address>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-amber-500 text-black hover:bg-amber-400"
                render={
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Golden+Spark+Opp+Agarwal+Eye+Hospital+5+Roads+Salem+Tamil+Nadu"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin aria-hidden />
                    Get directions
                  </a>
                }
              />
              <Button
                size="lg"
                variant="outline"
                className="border-neutral-700 bg-transparent text-white hover:bg-neutral-800 hover:text-white"
                render={
                  <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
                    <WhatsappIcon className="size-4" aria-hidden />
                    Chat on WhatsApp
                  </a>
                }
              />
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3 rounded-xl border border-white/10 bg-white/5 p-6 sm:col-span-2">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-amber-400 uppercase">
              <Phone aria-hidden className="size-4" /> Call or WhatsApp
            </p>
            <a
              href={PHONE_TEL}
              className="google-sans text-2xl font-bold text-white hover:text-amber-300"
            >
              {PHONE_DISPLAY}
            </a>
            <p className="text-sm text-neutral-400">
              Send your pricelist and we will prepare a bill for pickup or
              delivery.
            </p>
            <Button
              className="mt-2 w-full bg-amber-500 text-black hover:bg-amber-400"
              render={
                <a href={PHONE_TEL}>
                  <Phone aria-hidden />
                  Call now
                </a>
              }
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-3 text-sm text-muted-foreground">
        <Image
          src="/logo.png"
          alt=""
          width={28}
          height={28}
          className="h-7 w-7 rounded-md border object-cover"
        />
        Golden Spark Pvt Ltd · Every Spark has a Story
      </div>
    </section>
  );
}
