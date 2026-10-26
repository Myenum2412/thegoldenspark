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
  created_at?: string;
};

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

  const path = value.startsWith("/") ? value : `/Diwali/${value}`;
  return encodeURI(path);
}

