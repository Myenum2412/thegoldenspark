import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";

import { WhatsappIcon } from "@/components/ui/svgs/whatsappIcon";

const PHONE_DISPLAY = "+91 8248601417";
const PHONE_TEL = "tel:+918248601417";
const WHATSAPP = "https://wa.me/918248601417";

const SHOP_LINKS = [
  { label: "All products", href: "/shop" },
  { label: "Rockets", href: "/shop" },
  { label: "Fancy fountains", href: "/shop" },
  { label: "Gift & combo boxes", href: "/shop" },
];

const HELP_LINKS = [
  { label: "Delivery & pickup", href: "#visit" },
  { label: "Wholesale rates", href: "#visit" },
  { label: "Safety & storage", href: "#visit" },
  { label: "Contact us", href: "#visit" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-950 text-neutral-400">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Golden Spark logo"
              width={44}
              height={44}
              className="h-11 w-11 rounded-lg border border-neutral-800 object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-white">Golden Spark Pvt Ltd</p>
              <p className="text-xs">Every Spark has a Story</p>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Premium Sivakasi crackers for retail, bulk and wholesale — at direct
            factory rates from Salem, Tamil Nadu.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href={PHONE_TEL}
              className="inline-flex h-9 items-center gap-2 border border-neutral-700 px-3 text-sm text-white outline-none hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Phone aria-hidden className="size-4" />
              {PHONE_DISPLAY}
            </a>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-2 border border-neutral-700 px-3 text-sm text-white outline-none hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <WhatsappIcon className="size-4" aria-hidden />
              WhatsApp
            </a>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-white uppercase">Shop</p>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm">
            {SHOP_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="outline-none hover:text-white focus-visible:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-white uppercase">Help</p>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm">
            {HELP_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="outline-none hover:text-white focus-visible:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-white uppercase">Visit us</p>
          <address className="mt-4 flex flex-col gap-3 text-sm not-italic">
            <span className="flex gap-2">
              <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-amber-500" />
              Opp. Agarwal Eye Hospital, 5 Roads, Salem, Tamil Nadu.
            </span>
          </address>
          <p className="mt-4 text-xs text-neutral-500">
            Open 9am – 9pm · During festival season we stay open later.
          </p>
        </div>
      </div>

      <div className="border-t border-neutral-800">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs sm:flex-row">
          <p>© 2026 Golden Spark Pvt Ltd · Salem, Tamil Nadu</p>
          <p>Prices in INR. Fireworks sold to persons 18+. Follow local rules.</p>
        </div>
      </div>
    </footer>
  );
}
