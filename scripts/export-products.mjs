import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Client, Query, TablesDB } from "appwrite";
import { productImageSrc, getProductMinQty } from "../src/lib/store-data.ts";

const ENDPOINT = "https://sfo.cloud.appwrite.io/v1";
const PROJECT_ID = "6ac84fa0002e5ccfa934";
const DATABASE_ID = "billing_db";
const TABLE_ID = "products";

async function main() {
  const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
  const db = new TablesDB(client);
  const res = await db.listRows({
    databaseId: DATABASE_ID,
    tableId: TABLE_ID,
    queries: [Query.limit(200)],
  });

  const rows = res.rows.sort((a, b) => (Number(a.ordr) || 0) - (Number(b.ordr) || 0));

  let missing = 0;
  const products = rows.map((r, idx) => {
    let img = r.image ? String(r.image) : "";
    if (/28\s*angery\s*bird/i.test(r.name)) {
      img = "Electric Giant Crackers 28-Pack.png";
    } else if (/angery\s*bird/i.test(r.name)) {
      img = "Electric Giant Crackers Package.png";
    }
    const webSrc = productImageSrc(img);
    const decodedFile = webSrc ? decodeURI(webSrc.replace(/^\/Diwali\//, "")) : null;
    const exists = decodedFile ? existsSync(join(process.cwd(), "public", "Diwali", decodedFile)) : false;
    if (!exists) missing++;

    return {
      ordr: Number(r.ordr || idx + 1),
      id: r.$id,
      barcode: String(r.barcode || ""),
      name: String(r.name || ""),
      category: String(r.category || "General"),
      packing: String(r.packing || ""),
      mrp: Number(r.mrp || r.price || 0),
      special_rate: Number(r.price || 0),
      stock: Number(r.stock || 0),
      min_qty: getProductMinQty({ id: r.$id, name: r.name, barcode: r.barcode }),
      image_file: decodedFile,
      image_url: webSrc,
    };
  });

  console.log(`Fetched ${products.length} products. Missing images on disk: ${missing}`);
  await writeFile(
    join(process.cwd(), "docs", "products.json"),
    JSON.stringify(products, null, 2),
    "utf8"
  );
  console.log("Wrote docs/products.json successfully.");
}

main().catch(console.error);
