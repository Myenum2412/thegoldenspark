// Apply docs/product-image-map.json to the live Appwrite products table.
//
// Usage (from the repo root):
//   node --env-file=.env.local scripts/apply-product-images.mjs --dry-run
//   node --env-file=.env.local scripts/apply-product-images.mjs
//
// Each entry is matched to a product by barcode. The target file must exist in
// public/Diwali before anything is written, so a typo can never blank a card.
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Client, Query, TablesDB } from "appwrite";

const ENDPOINT =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://sfo.cloud.appwrite.io/v1";
const PROJECT_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6ac84fa0002e5ccfa934";
const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "billing_db";
const TABLE_ID = process.env.NEXT_PUBLIC_APPWRITE_TABLE_PRODUCTS || "products";
const API_KEY = process.env.APPWRITE_API_KEY?.trim();

const dryRun = process.argv.includes("--dry-run");

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
if (API_KEY) client.headers["X-Appwrite-Key"] = API_KEY;
const db = new TablesDB(client);

const map = JSON.parse(
  await readFile(new URL("../docs/product-image-map.json", import.meta.url), "utf8")
);

const missingFiles = map.filter(
  (entry) => !existsSync(join(process.cwd(), "public", "Diwali", entry.image))
);
if (missingFiles.length) {
  console.error(
    "Target images missing from public/Diwali:",
    missingFiles.map((entry) => `${entry.barcode} → ${entry.image}`).join(", ")
  );
  process.exit(1);
}

const res = await db.listRows({
  databaseId: DATABASE_ID,
  tableId: TABLE_ID,
  queries: [Query.limit(1000)],
});

const byBarcode = new Map(res.rows.map((row) => [String(row.barcode), row]));
const missingProducts = map.filter((entry) => !byBarcode.has(entry.barcode));
if (missingProducts.length) {
  console.error(
    "Products not found for barcodes:",
    missingProducts.map((entry) => entry.barcode).join(", ")
  );
  process.exit(1);
}

let updated = 0;
for (const entry of map) {
  const row = byBarcode.get(entry.barcode);
  if (String(row.image ?? "").trim() === entry.image) continue;
  console.log(
    `${dryRun ? "would set" : "setting"} ${entry.barcode} (${entry.name}): ${row.image ?? "(empty)"} -> ${entry.image}`
  );
  if (!dryRun) {
    await db.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      rowId: row.$id,
      data: { image: entry.image },
    });
  }
  updated++;
}

console.log(
  dryRun
    ? `dry run: ${updated} of ${map.length} product images need updating`
    : `updated ${updated} of ${map.length} product images`
);
