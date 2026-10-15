/**
 * Mock storefront catalogue for the Golden Spark e-commerce design.
 *
 * The ecomcn blocks expect a rich product shape (price, compareAt, colours,
 * ratings, reviews) that the Appwrite fireworks table does not carry. This
 * module is a self-contained stand-in so every block renders complete; swap
 * `SHOP_PRODUCTS` for a real source later without touching the components.
 */

export const SHOP_CURRENCY = "INR";
export const SHOP_LOCALE = "en-IN";
export const FREE_SHIPPING_THRESHOLD = 1500;

export interface ShopColor {
  name: string;
  /** Any CSS colour — rendered as a swatch, and the burst's accent tone. */
  hex: string;
}

export interface ShopProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  brand: string;
  blurb: string;
  /** Current price, in major units (INR). */
  price: number;
  /** Was-price; struck through only when higher than `price`. */
  compareAt?: number;
  rating: number;
  reviewCount: number;
  badge?: string;
  colors: ShopColor[];
  /** Seeds the generated artwork, so a product's burst is always the same. */
  seed: number;
}

export const SHOP_CATEGORIES = [
  { id: "rockets", label: "Rockets", blurb: "High-flying classics" },
  { id: "fountains", label: "Fancy Fountains", blurb: "Tall, slow, golden" },
  { id: "flower-pots", label: "Flower Pots", blurb: "Loud and bright" },
  { id: "sparklers", label: "Sparklers", blurb: "For the little ones" },
  { id: "aerial", label: "Aerial Shots", blurb: "Sky-filling repeats" },
  { id: "combos", label: "Gift & Combo Boxes", blurb: "Everything in one" },
] as const;

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: "gs-101",
    slug: "rocket-bomb-12",
    name: "Rocket Bomb · 12 Shots",
    category: "Rockets",
    brand: "Golden Spark",
    blurb:
      "Twelve whistling rockets that climb into a silver willow. Our most-ordered pack, year after year.",
    price: 349,
    compareAt: 499,
    rating: 4.7,
    reviewCount: 214,
    badge: "Bestseller",
    colors: [
      { name: "Gold", hex: "#f59e0b" },
      { name: "Crimson", hex: "#dc2626" },
      { name: "Emerald", hex: "#059669" },
    ],
    seed: 11,
  },
  {
    id: "gs-102",
    slug: "golden-fountain-5min",
    name: "Golden Fountain · 5 Minute",
    category: "Fancy Fountains",
    brand: "Sivakasi Gold",
    blurb:
      "Five uninterrupted minutes of gold rain. Stands on its own base, no hole to dig.",
    price: 599,
    compareAt: 799,
    rating: 4.8,
    reviewCount: 156,
    badge: "New",
    colors: [
      { name: "Gold", hex: "#fbbf24" },
      { name: "Silver", hex: "#cbd5e1" },
    ],
    seed: 23,
  },
  {
    id: "gs-103",
    slug: "flower-pot-jumbo",
    name: "Flower Pot · Jumbo",
    category: "Flower Pots",
    brand: "Golden Spark",
    blurb:
      "A single deep boom that rattles windows, then a fountain of coloured petals.",
    price: 249,
    compareAt: 329,
    rating: 4.6,
    reviewCount: 302,
    colors: [
      { name: "Assorted", hex: "#e11d48" },
      { name: "Blue", hex: "#2563eb" },
    ],
    seed: 37,
  },
  {
    id: "gs-104",
    slug: "electric-sparklers-7cm",
    name: "7cm Electric Sparklers",
    category: "Sparklers",
    brand: "Little Sparks",
    blurb:
      "Low-smoke, cool-burning sparklers — the safest way to hand a child a light.",
    price: 89,
    compareAt: 129,
    rating: 4.5,
    reviewCount: 540,
    badge: "Kid Safe",
    colors: [
      { name: "Gold", hex: "#f59e0b" },
      { name: "Green", hex: "#22c55e" },
      { name: "Pink", hex: "#ec4899" },
    ],
    seed: 41,
  },
  {
    id: "gs-105",
    slug: "sky-king-30-shot",
    name: "Sky King · 30 Shot",
    category: "Aerial Shots",
    brand: "Sivakasi Gold",
    blurb:
      "Thirty shells in under a minute — peonies, palms and a thunderous finale.",
    price: 1299,
    compareAt: 1599,
    rating: 4.9,
    reviewCount: 98,
    badge: "Premium",
    colors: [
      { name: "Gold", hex: "#f59e0b" },
      { name: "Violet", hex: "#8b5cf6" },
    ],
    seed: 53,
  },
  {
    id: "gs-106",
    slug: "kids-combo-box",
    name: "Kids Combo Box",
    category: "Gift & Combo Boxes",
    brand: "Little Sparks",
    blurb:
      "Sparklers, chakkars and pop-pops curated for small hands and early bedtimes.",
    price: 449,
    compareAt: 599,
    rating: 4.7,
    reviewCount: 176,
    badge: "Combo",
    colors: [
      { name: "Party", hex: "#f472b6" },
      { name: "Classic", hex: "#f59e0b" },
    ],
    seed: 67,
  },
  {
    id: "gs-107",
    slug: "chakra-deluxe",
    name: "Chakra Deluxe",
    category: "Flower Pots",
    brand: "Golden Spark",
    blurb:
      "Ground spinners that hiss into a wheel of colour and lift off at the end.",
    price: 199,
    compareAt: 259,
    rating: 4.4,
    reviewCount: 263,
    colors: [
      { name: "Rainbow", hex: "#06b6d4" },
      { name: "Gold", hex: "#f59e0b" },
    ],
    seed: 71,
  },
  {
    id: "gs-108",
    slug: "double-sound-whistle",
    name: "Double Sound Whistle",
    category: "Fancy Fountains",
    brand: "Sivakasi Gold",
    blurb:
      "A screaming whistle up, a double crack down — the loudest thing in the box.",
    price: 379,
    compareAt: 459,
    rating: 4.6,
    reviewCount: 121,
    colors: [{ name: "Gold", hex: "#f59e0b" }],
    seed: 83,
  },
  {
    id: "gs-109",
    slug: "peacock-fountain",
    name: "Peacock Fountain",
    category: "Fancy Fountains",
    brand: "Golden Spark",
    blurb:
      "Fans open like a peacock's tail in green and gold, then fade to a shimmer.",
    price: 289,
    compareAt: 359,
    rating: 4.5,
    reviewCount: 87,
    colors: [
      { name: "Green", hex: "#16a34a" },
      { name: "Gold", hex: "#f59e0b" },
    ],
    seed: 89,
  },
  {
    id: "gs-110",
    slug: "bullet-bomb",
    name: "Bullet Bomb",
    category: "Rockets",
    brand: "Sivakasi Gold",
    blurb:
      "A single, straight, ear-ringing crack that has no equal in the sky.",
    price: 459,
    compareAt: 599,
    rating: 4.8,
    reviewCount: 143,
    colors: [
      { name: "Red", hex: "#dc2626" },
      { name: "Gold", hex: "#f59e0b" },
    ],
    seed: 97,
  },
  {
    id: "gs-111",
    slug: "diamond-sparklers",
    name: "Diamond Sparklers",
    category: "Sparklers",
    brand: "Little Sparks",
    blurb:
      "Long 15cm sparklers that crackle like diamonds — perfect for the family photo.",
    price: 149,
    compareAt: 199,
    rating: 4.6,
    reviewCount: 402,
    colors: [
      { name: "Silver", hex: "#cbd5e1" },
      { name: "Gold", hex: "#f59e0b" },
    ],
    seed: 101,
  },
  {
    id: "gs-112",
    slug: "family-mega-combo",
    name: "Family Mega Combo",
    category: "Gift & Combo Boxes",
    brand: "Golden Spark",
    blurb:
      "The whole celebration in one crate: 48 items across every category we sell.",
    price: 2499,
    compareAt: 3499,
    rating: 4.9,
    reviewCount: 64,
    badge: "Family Pack",
    colors: [
      { name: "Gold", hex: "#f59e0b" },
      { name: "Crimson", hex: "#dc2626" },
      { name: "Emerald", hex: "#059669" },
    ],
    seed: 113,
  },
];

export type ShopSort =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "rating";

/** A stable ordering for the given sort key. Never mutates the input. */
export function sortShopProducts<
  T extends { price: number; rating: number; reviewCount: number; seed: number },
>(products: T[], sort: ShopSort): T[] {
  const list = [...products];
  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "rating":
      return list.sort((a, b) => b.rating - a.rating);
    case "newest":
      return list.sort((a, b) => b.seed - a.seed);
    case "featured":
    default:
      return list.sort((a, b) => b.reviewCount - a.reviewCount);
  }
}

/** The products belonging to a category (by label), for the category rail. */
export function productsByCategory(category: string): ShopProduct[] {
  return SHOP_PRODUCTS.filter((p) => p.category === category);
}

/* ─── reviews ───────────────────────────────────────────────────────────── */

export interface ShopReview {
  id: string;
  rating: number;
  title?: string;
  body: string;
  author: string;
  date: string;
  verified?: boolean;
  variant?: string;
}

export const SHOP_REVIEWS: ShopReview[] = [
  {
    id: "r-1",
    rating: 5,
    title: "Whole street came out to watch",
    body: "Ordered the Sky King and the Golden Fountain for Diwali. Genuinely the loudest, brightest set we have had in years, and the colours lasted ages.",
    author: "Karthik R.",
    date: "2026-09-28",
    verified: true,
    variant: "Sky King · 30 Shot",
  },
  {
    id: "r-2",
    rating: 5,
    title: "Worth the drive to Salem",
    body: "Wholesale rates, no middleman markup, and they loaded everything into the car for us. Second year running and it will be a third.",
    author: "Priya M.",
    date: "2026-09-14",
    verified: true,
    variant: "Family Mega Combo",
  },
  {
    id: "r-3",
    rating: 4,
    title: "Kids were delighted",
    body: "The children's box is well thought out — sparklers that do not smoke much and easy pop-pops. Only wish it had a couple more chakkars.",
    author: "Anonymous",
    date: "2026-08-30",
    verified: true,
    variant: "Kids Combo Box",
  },
  {
    id: "r-4",
    rating: 5,
    title: "Proper Sivakasi quality",
    body: "You can tell the difference from the local shop stuff immediately. Clean moisture-proof packing and not one dud in the whole lot.",
    author: "Faizal A.",
    date: "2026-08-21",
    verified: true,
    variant: "Rocket Bomb · 12 Shots",
  },
  {
    id: "r-5",
    rating: 4,
    title: "Beautiful golden rain",
    body: "The five-minute fountain really does run five minutes. Neighbours asked where we bought it. Delivery took a day longer than promised.",
    author: "Deepa S.",
    date: "2026-08-05",
    variant: "Golden Fountain · 5 Minute",
  },
  {
    id: "r-6",
    rating: 5,
    title: "Great for weddings",
    body: "Used the aerial shots for a reception send-off. Timing was perfect and the finale surprised everyone. Will order again for the next function.",
    author: "Vignesh K.",
    date: "2026-07-24",
    verified: true,
  },
  {
    id: "r-7",
    rating: 3,
    title: "Good, but very loud",
    body: "Quality is genuinely excellent, but do warn your guests — the double sound whistles are seriously loud. Neighbour complaints, not our fault.",
    author: "Anonymous",
    date: "2026-07-11",
    verified: true,
    variant: "Double Sound Whistle",
  },
  {
    id: "r-8",
    rating: 5,
    title: "Fast WhatsApp ordering",
    body: "Sent my list on WhatsApp, got the bill in ten minutes and pickup was ready when we arrived. Very smooth.",
    author: "Ravi N.",
    date: "2026-06-30",
    verified: true,
  },
];

export const SHOP_REVIEW_DISTRIBUTION: [number, number, number, number, number] = [
  3, 6, 24, 96, 421,
];
