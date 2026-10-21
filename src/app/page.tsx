import Image from "next/image";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  MapPin,
  Phone,
} from "lucide-react";
import { WhatsappIcon } from "@/components/ui/svgs/whatsappIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import Stats01 from "@/components/stats-01";
import PricelistTable from "@/components/pricelist-table";
import { listProducts } from "@/lib/store.server";
import type { Product } from "@/lib/store-data";

const PHONE_DISPLAY = "+91 9087606352";
const PHONE_TEL = "tel:+919087606352";
const WHATSAPP = "https://wa.me/919087606352";

async function getProducts(): Promise<Product[]> {
  try {
    return await listProducts();
  } catch {
    return [];
  }
}

// Streamed inside Suspense so the uncached Appwrite read (Cache Components
// enabled) doesn't block prerendering of the shell. `connection()` defers the
// read to request time; without it the pricelist (including product images)
// would be baked into the static shell and stay stale until the next deploy.
async function PricelistSection() {
  await connection();
  const products = await getProducts();
  return <PricelistTable products={products} />;
}

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      {/* ── Premium hero ─────────────────────────────── */}
      <section className="relative overflow-hidden bg-neutral-950 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(245,158,11,0.35),transparent),radial-gradient(ellipse_40%_35%_at_85%_110%,rgba(234,88,12,0.25),transparent),radial-gradient(ellipse_40%_35%_at_10%_110%,rgba(245,158,11,0.15),transparent)]"
        />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-8 text-center sm:py-12">
          <Image
            src="/logo.png"
            alt="Golden Spark logo"
            width={240}
            height={240}
            className="h-24 w-24 object-contain sm:h-32 sm:w-32"
            priority
          />
          <h1 className="google-sans mt-5 text-3xl font-bold tracking-tight sm:text-5xl">
            Golden{" "}
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
              Spark
            </span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-neutral-400 sm:text-base">
            Every Spark has a Story — light up your celebrations with premium
            crackers, directly from Sivakasi.
          </p>
          <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row">
            <Button
              size="lg"
              className="bg-amber-500 text-black hover:bg-amber-400"
              render={
                <a href={PHONE_TEL}>
                  <Phone aria-hidden="true" />
                  Call {PHONE_DISPLAY}
                </a>
              }
            />
            <Button
              size="lg"
              variant="outline"
              className="border-neutral-700 bg-transparent text-white hover:bg-neutral-800 hover:text-white"
              render={
                <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
                  <WhatsappIcon className="size-4" aria-hidden="true" />
                  WhatsApp Us
                </a>
              }
            />
          </div>
        </div>
      </section>

      {/* ── Trust highlights (stats-01 block) ────────── */}
      <section className="mx-auto w-full max-w-6xl px-3 py-8 sm:px-4 sm:py-10">
        <Stats01 />
      </section>

      {/* ── Pricelist with add to cart ─────────────── */}
      <section className="mx-auto w-full max-w-6xl px-3 pb-8 sm:px-4 sm:pb-10">
        <Suspense
          fallback={
            <div className="h-64 animate-pulse rounded-xl border border-border bg-muted/40" />
          }
        >
          <PricelistSection />
        </Suspense>
      </section>

      {/* ── Visit us / company card ──────────────────── */}
      <section id="visit" className="mx-auto w-full max-w-6xl px-3 py-8 sm:px-4 sm:py-10">
        <div className="text-center">
          <Badge
            variant="secondary"
            className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300"
          >
            <MapPin className="size-3.5" aria-hidden="true" />
            Find Us
          </Badge>
          <h2 className="google-sans mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Visit Our Store
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Golden Spark Pvt Ltd — walk in or reach out, we love talking
            fireworks.
          </p>
        </div>
        <div className="relative mt-8 overflow-hidden rounded-2xl border border-border bg-neutral-950 text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_15%_0%,rgba(245,158,11,0.25),transparent),radial-gradient(ellipse_40%_50%_at_90%_100%,rgba(234,88,12,0.2),transparent)]"
          />
          <div className="relative grid gap-6 p-6 sm:grid-cols-5 sm:p-10">
            <div className="sm:col-span-3">
              <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-amber-400 uppercase">
                <MapPin className="size-4" aria-hidden="true" />
                Our Address
              </p>
              <address className="google-sans mt-3 text-xl leading-relaxed font-medium text-white not-italic sm:text-2xl">
                Golden Spark Pvt Ltd, Opp. To Agarwal Eye Hospital, 5 Roads,
                Salem, Tamil Nadu.
              </address>
              <Button
                size="lg"
                className="mt-6 bg-amber-500 text-black hover:bg-amber-400"
                render={
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Golden+Spark+Opp+Agarwal+Eye+Hospital+5+Roads+Salem+Tamil+Nadu"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin aria-hidden="true" />
                    Get Directions
                  </a>
                }
              />
            </div>
            <div className="flex flex-col justify-center gap-3 rounded-xl border border-white/10 bg-white/5 p-6 sm:col-span-2">
              <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-amber-400 uppercase">
                <Phone className="size-4" aria-hidden="true" />
                Call or WhatsApp
              </p>
              <a
                href={PHONE_TEL}
                className="google-sans text-2xl font-bold text-white hover:text-amber-300"
              >
                {PHONE_DISPLAY}
              </a>
              <div className="mt-2 flex flex-col gap-2">
                <Button
                  className="w-full bg-amber-500 text-black hover:bg-amber-400"
                  render={
                    <a href={PHONE_TEL}>
                      <Phone aria-hidden="true" />
                      Call Now
                    </a>
                  }
                />
                <Button
                  variant="outline"
                  className="w-full border-neutral-700 bg-transparent text-white hover:bg-neutral-800 hover:text-white"
                  render={
                    <a
                      href={WHATSAPP}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <WhatsappIcon className="size-4" aria-hidden="true" />
                      Chat on WhatsApp
                    </a>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="border-t border-border bg-neutral-950 text-neutral-400">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Golden Spark logo"
              width={40}
              height={40}
              className="h-10 w-10 rounded-lg border border-neutral-800 object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-white">
                Golden Spark Pvt Ltd
              </p>
              <p className="text-xs">Every Spark has a Story</p>
            </div>
          </div>
          <p className="text-xs">
            Salem, Tamil Nadu • {PHONE_DISPLAY} • © 2026 Golden Spark Pvt Ltd
          </p>
        </div>
      </footer>
      <Toaster />
    </main>
  );
}
