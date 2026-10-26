export const SETUP_SQL = `-- The Appwrite "Billing" database is the backend (TablesDB).
-- Configuration lives in .env.local locally, or in the host's env vars:
--   1. NEXT_PUBLIC_APPWRITE_DATABASE_ID      (default: billing_db)
--   2. NEXT_PUBLIC_APPWRITE_TABLE_PRODUCTS   (default: products)
--      NEXT_PUBLIC_APPWRITE_TABLE_CLIENTS    (default: clients)
--      NEXT_PUBLIC_APPWRITE_TABLE_SALES      (default: sales)
--   3. APPWRITE_API_KEY — optional server-only key (databases.read + tables.read/write).
--      The Billing tables allow anonymous access, so it is not required.
-- The login user lives under Auth → Users in the Appwrite console.`;

export type Customer = {
  id: string | number;
  name: string;
  address: string;
  pincode: string;
  phone: string;
  created_at?: string;
};

export type Product = {
  id: string | number;
  ordr?: number;
  item_no: number;
  barcode: string;
  name: string;
  category: string;
  packing: string;
  mrp: number;
  special_rate: number;
  stock: number;
  image?: string;
  min_qty?: number;
  created_at?: string;
};

// Minimum start quantity per product when adding to cart.
// Products not listed default to 1.
export const PRODUCT_MIN_QTY_BY_NAME: Record<string, number> = {
  // 5 count start:
  "3.5\" LAKSHMI CRACKERS": 5,
  "4\" LAKSHMI CRACKERS": 5,
  "LAKSHMI DLX CRACKERS": 5,
  "7 CM ELECTRIC SPARKLERS": 5,
  "10 CM ELECTRIC SPARKLERS": 5,
  "12 CM RED SPARKLERS": 5,
  "12 CM GREEN SPARKLERS": 5,
  "10 CM RAINBOW SPARKLERS 4 IN 1": 5,

  // 10 count start:
  "2.5\" WETWO CRACKERS": 10,

  // 2 count start:
  "15 CM ELECTRIC SPARKLERS": 2,
  "30 CM COLOUR SPARKLERS": 2,
  "15 CM RED SPARKLERS": 2,
  "15 CM GREEN SPARKLERS": 2,
  "30 CM RED SPARKLERS": 2,
  "30 CM GREEN SPARKLERS": 2,
  "GROUND CHAKKAR BIG": 2,
  "RED BIJILI CRACKERS": 2,
  "STRIPPED BIJILI CRACKERS": 2,
  "56 ANGERY BIRD": 2,
  "28 ANGERY BIRD": 2,
  "SUPER SHOW": 2,
  "AMBER SHOW": 2,
  "RUBY SHOW": 2,
  "MINI": 2,
  "MINI (100 wala)": 2,
};

// Also support matching by barcode/item code as fallback
export const PRODUCT_MIN_QTY_BY_CODE: Record<string, number> = {
  R03: 5, // 3.5" LAKSHMI CRACKERS
  R01: 5, // 4" LAKSHMI CRACKERS
  R05: 10, // 2.5" WETWO CRACKERS
  R07: 5, // LAKSHMI DLX CRACKERS
  S01: 5, // 7 CM ELECTRIC SPARKLERS
  S02: 5, // 10 CM ELECTRIC SPARKLERS
  S16: 5, // 12 CM RED SPARKLERS
  S15: 5, // 12 CM GREEN SPARKLERS
  SP26: 5, // 10 CM RAINBOW SPARKLERS 4 IN 1
  S04: 2, // 15 CM ELECTRIC SPARKLERS
  S10: 2, // 30 CM COLOUR SPARKLERS
  S18: 2, // 15 CM RED SPARKLERS
  S17: 2, // 15 CM GREEN SPARKLERS
  S20: 2, // 30 CM RED SPARKLERS
  S19: 2, // 30 CM GREEN SPARKLERS
  R10: 2, // GROUND CHAKKAR BIG
  R56: 2, // RED BIJILI CRACKERS
  R58: 2, // STRIPPED BIJILI CRACKERS
  R48: 2, // 56 ANGERY BIRD
  "CRK-054": 2, // 28 ANGERY BIRD
  "CRK-057": 2, // SUPER SHOW
  "CRK-058": 2, // AMBER SHOW
  "CRK-059": 2, // RUBY SHOW
  W01: 2, // MINI (100 wala)
};

export function getProductMinQty(
  product?: {
    name?: string;
    barcode?: string;
    min_qty?: number;
    id?: string | number;
  } | null
): number {
  if (!product) return 1;
  if (typeof product.min_qty === "number" && product.min_qty > 0) {
    return product.min_qty;
  }
  const name = (product.name ?? "").trim().toUpperCase();
  if (PRODUCT_MIN_QTY_BY_NAME[name]) {
    return PRODUCT_MIN_QTY_BY_NAME[name];
  }
  for (const [key, qty] of Object.entries(PRODUCT_MIN_QTY_BY_NAME)) {
    if (name === key.toUpperCase() || name.startsWith(key.toUpperCase())) {
      return qty;
    }
  }
  const code = (product.barcode ?? "").trim().toUpperCase();
  if (PRODUCT_MIN_QTY_BY_CODE[code]) {
    return PRODUCT_MIN_QTY_BY_CODE[code];
  }
  return 1;
}

const LEGACY_IMAGE_MAP: Record<string, string> = {
  "we_two_s_sword_fireworks_box.webp": "We Two’s Sword Fireworks Box.png",
  "wetwo_electric_sparklers_box.webp": "WeTwo Electric Sparklers Box.png",
  "diwali_firecracker_pack_with_goddess_labels.webp": "Diwali Firecracker Pack with Goddess Labels.png",
  "colourful_wetwo_firecracker_bundle.webp": "Colourful WeTwo Firecracker Bundle.png",
};

// Product images live in /public/Diwali. The stored value may be a bare
// filename ("Lakshmi Deluxe Firework Bundle.png"), a root-relative path, or a
// full URL. Filenames contain spaces/apostrophes, so encode the path before
// handing it to next/image.
export function productImageSrc(image?: string | null): string | null {
  if (!image) return null;
  let value = image.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;

  // Handle legacy or imported asset paths (e.g. "assets/product_images/...")
  if (value.startsWith("/") && value.includes("assets/product_images/")) {
    value = value.replace(/^\//, "");
  }
  if (value.startsWith("assets/product_images/")) {
    const base = value.replace(/^assets\/product_images\//, "");
    if (LEGACY_IMAGE_MAP[base]) {
      value = LEGACY_IMAGE_MAP[base];
    } else {
      value = base;
    }
  }

  if (value === "Electric Giant Crackers Package") {
    value = "Electric Giant Crackers Package.png";
  } else if (!value.startsWith("/") && !/\.(png|jpe?g|webp|svg|gif)$/i.test(value)) {
    value = `${value}.png`;
  }

  const path = value.startsWith("/") ? value : `/Diwali/${value}`;
  return encodeURI(path);
}

