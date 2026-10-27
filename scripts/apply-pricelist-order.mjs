// Apply docs/pricelist-order.json to the live Appwrite products table.
//
// Usage (from the repo root):
//   node --env-file=.env.local scripts/apply-pricelist-order.mjs --dry-run
//   node --env-file=.env.local scripts/apply-pricelist-order.mjs
//
// Each row in the order file is matched to a product by barcode, then its
// `ordr` column is updated. Rows are idempotent: unchanged products are
// skipped. An optional APPWRITE_API_KEY is used when present; the Billing
// tables otherwise allow anonymous writes.
import { readFile } from "node:fs/promises";
import { Client, TablesDB, Query } from "appwrite";

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://sfo.cloud.appwrite.io/v1";
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6ac84fa0002e5ccfa934";
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "billing_db";
const TABLE_ID = process.env.NEXT_PUBLIC_APPWRITE_TABLE_PRODUCTS || "products";
const API_KEY = process.env.APPWRITE_API_KEY?.trim();

const dryRun = process.argv.includes("--dry-run");

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
if (API_KEY) client.headers["X-Appwrite-Key"] = API_KEY;
const db = new TablesDB(client);

const order = JSON.parse(
  await readFile(new URL("../docs/pricelist-order.json", import.meta.url), "utf8")
);

const res = await db.listRows({
  databaseId: DATABASE_ID,
  tableId: TABLE_ID,
  queries: [Query.limit(1000)],
});

const byBarcode = new Map(res.rows.map((row) => [String(row.barcode), row]));
const missing = order.filter((entry) => !byBarcode.has(entry.barcode));

if (missing.length) {
  console.error("Missing products for barcodes:", missing.map((m) => m.barcode).join(", "));
  process.exit(1);
}

let updated = 0;
for (const entry of order) {
  const row = byBarcode.get(entry.barcode);
  if (Number(row.ordr) === entry.ordr) continue;
  console.log(
    `${dryRun ? "would set" : "setting"} ${entry.barcode} (${entry.name}): ${row.ordr} -> ${entry.ordr}`
  );
  if (!dryRun) {
    await db.updateRow({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      rowId: row.$id,
      data: { ordr: entry.ordr },
    });
  }
  updated++;
}

console.log(
  dryRun
    ? `dry run: ${updated} of ${order.length} products need updating`
    : `updated ${updated} of ${order.length} products`
);
