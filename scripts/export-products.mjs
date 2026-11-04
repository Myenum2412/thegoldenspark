import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Client, Query, TablesDB } from "appwrite";

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://sfo.cloud.appwrite.io/v1";
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6ac84fa0002e5ccfa934";
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "billing_db";
const TABLE_ID = process.env.NEXT_PUBLIC_APPWRITE_TABLE_PRODUCTS || "products";
const API_KEY = process.env.APPWRITE_API_KEY?.trim();

function productImageSrc(image) {
  if (!image) return null;
  const value = String(image).trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const fileName = value.replace(/^.*[\/\\]/, "");
  return encodeURI(`/Diwali/${fileName}`);
}

function getProductMinQty(product) {
  const name = (product?.name ?? "").trim().toUpperCase();
  const code = (product?.barcode ?? "").trim().toUpperCase();
  if (
    [
      '3.5" LAKSHMI CRACKERS',
      '4" LAKSHMI CRACKERS',
      "LAKSHMI DLX CRACKERS",
      "7 CM ELECTRIC SPARKLERS",
      "10 CM ELECTRIC SPARKLERS",
      "12 CM RED SPARKLERS",
      "12 CM GREEN SPARKLERS",
      "10 CM RAINBOW SPARKLERS 4 IN 1",
    ].includes(name) ||
    ["R03", "R01", "R07", "S01", "S02", "S16", "S15", "SP26"].includes(code)
  ) {
    return 5;
  }
  if (name === '2.5" WETWO CRACKERS' || code === "R05") return 10;
  if (
    [
      "15 CM ELECTRIC SPARKLERS",
      "30 CM COLOUR SPARKLERS",
      "15 CM RED SPARKLERS",
      "15 CM GREEN SPARKLERS",
      "30 CM RED SPARKLERS",
      "30 CM GREEN SPARKLERS",
      "GROUND CHAKKAR BIG",
      "RED BIJILI CRACKERS",
      "STRIPPED BIJILI CRACKERS",
      "56 ANGERY BIRD",
      "28 ANGERY BIRD",
      "SUPER SHOW",
      "AMBER SHOW",
      "RUBY SHOW",
      "MINI",
      "MINI (100 WALA)",
    ].includes(name) ||
    [
      "S04",
      "S10",
      "S18",
      "S17",
      "S20",
      "S19",
      "R10",
      "R56",
      "R58",
      "R48",
      "CRK-054",
      "CRK-057",
      "CRK-058",
      "CRK-059",
      "W01",
    ].includes(code)
  ) {
    return 2;
  }
  return 1;
}

async function main() {
  const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
  if (API_KEY) client.headers["X-Appwrite-Key"] = API_KEY;
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
    } else if (/toy\s*\(700\s*wala\)/i.test(r.name) || r.barcode === "W04") {
      img = "Regal Lion Pyro Toy King Box.png";
    } else if (/nayagara/i.test(r.name) || r.barcode === "CRK-107") {
      img = "Nayagara Falls Fireworks Box.png";
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
