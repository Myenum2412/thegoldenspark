import Image from "next/image";
import {
  BadgeCheck,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  ShieldCheck,
  Sparkles,
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
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import CustomerForm from "@/components/customer-form";

const PHONE_DISPLAY = "+91 99629 70062";
const PHONE_TEL = "tel:+919962970062";
const WHATSAPP = "https://wa.me/919962970062";

const highlights = [
  {
    icon: BadgeCheck,
    title: "Genuine Quality",
    text: "Handpicked crackers sourced directly from Sivakasi makers.",
  },
  {
    icon: Package,
    title: "Retail & Bulk",
    text: "From single family packs to full wholesale orders.",
  },
  {
    icon: ShieldCheck,
    title: "Safe & Certified",
    text: "Quality-checked products with clear safety instructions.",
  },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      {/* ── Premium hero ─────────────────────────────── */}
      <section className="relative overflow-hidden bg-neutral-950 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(245,158,11,0.35),transparent),radial-gradient(ellipse_40%_35%_at_85%_110%,rgba(234,88,12,0.25),transparent),radial-gradient(ellipse_40%_35%_at_10%_110%,rgba(245,158,11,0.15),transparent)]"
        />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-16 text-center sm:py-24">
          <Badge
            variant="secondary"
            className="border-amber-500/30 bg-amber-500/10 text-amber-300"
          >
            <Sparkles className="size-3.5" aria-hidden="true" />
            Premium Fireworks • Sivakasi
          </Badge>
          <Image
            src="/logo.png"
            alt="Golden Spark logo"
            width={160}
            height={160}
            className="mt-8 h-36 w-36 rounded-3xl border border-amber-500/30 object-cover shadow-[0_0_80px_-10px_rgba(245,158,11,0.6)]"
            priority
          />
          <h1 className="google-sans mt-8 text-4xl font-bold tracking-tight sm:text-6xl">
            Golden{" "}
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
              Spark
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-neutral-400 sm:text-lg">
            Every Spark has a Story — light up your celebrations with premium
            crackers, directly from Sivakasi.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
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
                  <MessageCircle aria-hidden="true" />
                  WhatsApp Us
                </a>
              }
            />
          </div>
        </div>
      </section>

      {/* ── Trust highlights ─────────────────────────── */}
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-10 sm:grid-cols-3">
        {highlights.map((h) => (
          <Card key={h.title} className="border-border/60">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <h.icon className="size-5" aria-hidden="true" />
              </span>
              <CardTitle className="text-base">{h.title}</CardTitle>
            </CardHeader>
            <CardContent className="-mt-2 text-sm text-muted-foreground">
              {h.text}
            </CardContent>
          </Card>
        ))}
      </section>

      <Separator className="mx-auto max-w-6xl" />

      {/* ── Visit us / company card ──────────────────── */}
      <section id="visit" className="mx-auto w-full max-w-6xl px-4 py-10">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent">
            <CardHeader>
              <CardTitle className="google-sans text-2xl">
                Visit Our Store
              </CardTitle>
              <CardDescription>
                Golden Spark Pvt Ltd — walk in or reach out, we love talking
                fireworks.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg border border-border bg-background/60 p-4">
                <MapPin
                  className="mt-0.5 size-5 shrink-0 text-amber-500"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-semibold">Our Address</p>
                  <address className="mt-1 text-sm leading-relaxed text-muted-foreground not-italic">
                    Golden Spark Pvt Ltd, No. 2, Mullai Nagar First Street,
                    N.R.K.R. Nagar (Near N.R.K.R. Marriage Hall), Sivakasi –
                    626123.
                  </address>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border bg-background/60 p-4">
                <Phone
                  className="mt-0.5 size-5 shrink-0 text-amber-500"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-semibold">Call or WhatsApp</p>
                  <a
                    href={PHONE_TEL}
                    className="mt-1 block text-sm text-muted-foreground hover:text-foreground"
                  >
                    {PHONE_DISPLAY}
                  </a>
                  <a
                    href={WHATSAPP}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block text-sm text-amber-600 hover:text-amber-500"
                  >
                    Chat on WhatsApp →
                  </a>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </section>

      {/* ── Customer form ────────────────────────────── */}
      <section className="mx-auto w-full max-w-2xl px-4 pb-10">
        <CustomerForm />
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
            Sivakasi – 626123 • {PHONE_DISPLAY} • © 2026 Golden Spark Pvt Ltd
          </p>
        </div>
      </footer>
      <Toaster />
    </main>
  );
}
