// Server-only data layer. Backed by the existing Appwrite "Billing" database
// through the TablesDB API + API key. Import this only from server code
// (route handlers, server components); client components use ./store.ts.
import { ID, Query } from "appwrite";
import type { Models } from "appwrite";
import { APPWRITE_DATABASE_ID, TABLES } from "./appwrite";
import { tables } from "./appwrite-server";
import type { Customer, Product } from "./store-data";
import type { Order, OrderItem } from "@/components/order-view";

type Row = Models.Row & { [key: string]: unknown };

// The Billing schema stores a sale's lines as a JSON array inside itemsJson.
type RawItem = {
  productId?: string;
  name?: string;
  price?: number;
  quantity?: number;
  total?: number;
};

function parseItems(json: unknown): RawItem[] {
  if (typeof json !== "string" || json.trim() === "") return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as RawItem[]) : [];
  } catch {
    return [];
  }
}

function itemNoFromBarcode(barcode: unknown): number {
  const text = barcode == null ? "" : String(barcode);
  const digits = text.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

// ── Row → app model ───────────────────────────────────────

function toProduct(row: Row): Product {
  const price = Number(row.price ?? 0);
  return {
    id: row.$id,
    ordr: Number(row.ordr ?? 0),
    item_no: itemNoFromBarcode(row.barcode),
    barcode: String(row.barcode ?? ""),
    name: String(row.name ?? ""),
    category: String(row.category ?? "General"),
    packing: String(row.packing ?? ""),
    mrp: Number(row.mrp ?? price),
    special_rate: price,
    stock: Number(row.stock ?? 0),
    created_at: row.$createdAt,
  };
}

function toCustomer(row: Row): Customer {
  return {
    id: row.$id,
    name: String(row.name ?? ""),
    // Billing clients only store name + phone; address is not persisted.
    address: "",
    pincode: "",
    phone: String(row.phone ?? ""),
    created_at: row.$createdAt,
  };
}

function toOrder(row: Row, phone: string): Order {
  return {
    id: row.$id,
    customer_id: (row.clientId as string | null) ?? null,
    customer_name: String(row.clientName ?? ""),
    phone,
    total: Number(row.total ?? 0),
    status: "new",
    created_at: String(row.createdAt ?? row.$createdAt ?? ""),
  };
}

async function phoneByClientId(): Promise<Map<string, string>> {
  const res = await tables().listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: TABLES.clients,
    queries: [Query.limit(1000)],
  });
  const map = new Map<string, string>();
  for (const row of res.rows as Row[]) {
    map.set(row.$id, String(row.phone ?? ""));
  }
  return map;
}

// ── Products ──────────────────────────────────────────────

export async function listProducts(): Promise<Product[]> {
  const res = await tables().listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: TABLES.products,
    queries: [Query.limit(1000)],
  });
  return (res.rows as Row[])
    .map(toProduct)
    .sort(
      (a, b) =>
        (a.ordr || Number.MAX_SAFE_INTEGER) - (b.ordr || Number.MAX_SAFE_INTEGER) ||
        a.name.localeCompare(b.name)
    );
}

export async function createProduct(data: {
  item_no: number;
  name: string;
  category: string;
  packing: string;
  mrp: number;
  special_rate: number;
  stock: number;
}): Promise<void> {
  const price = data.special_rate || data.mrp || 0;
  await tables().createRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: TABLES.products,
    rowId: ID.unique(),
    data: {
      localId: ID.unique(),
      name: data.name,
      barcode: String(data.item_no),
      price,
      stock: data.stock,
      packing: data.packing || "",
      mrp: data.mrp || 0,
    },
  });
}

export async function updateProduct(
  id: string,
  data: {
    name: string;
    category: string;
    packing: string;
    mrp: number;
    special_rate: number;
    stock: number;
  }
): Promise<void> {
  await tables().updateRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: TABLES.products,
    rowId: id,
    data: {
      name: data.name,
      price: data.special_rate || data.mrp || 0,
      stock: data.stock,
      packing: data.packing || "",
      mrp: data.mrp || 0,
    },
  });
}

export async function deleteProducts(ids: string[]): Promise<void> {
  await Promise.all(
    ids.map((id) =>
      tables().deleteRow({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: TABLES.products,
        rowId: id,
      })
    )
  );
}

// ── Customers ─────────────────────────────────────────────

export async function listCustomers(): Promise<Customer[]> {
  const res = await tables().listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: TABLES.clients,
    queries: [Query.limit(1000)],
  });
  return (res.rows as Row[])
    .map(toCustomer)
    .sort((a, b) =>
      String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""))
    );
}

export async function createCustomer(data: {
  name: string;
  phone: string;
  address: string;
  pincode: string;
}): Promise<{ id: string }> {
  const row = await tables().createRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: TABLES.clients,
    rowId: ID.unique(),
    data: {
      localId: ID.unique(),
      name: data.name,
      phone: data.phone,
    },
  });
  return { id: row.$id };
}

// Deletes customers plus their sales rows first, so nothing is orphaned.
export async function deleteCustomersWithOrders(ids: string[]): Promise<void> {
  for (const customerId of ids) {
    const sales = await tables().listRows({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: TABLES.sales,
      queries: [Query.equal("clientId", customerId), Query.limit(1000)],
    });
    await deleteOrdersWithItems((sales.rows as Row[]).map((r) => r.$id));
    await tables().deleteRow({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: TABLES.clients,
      rowId: customerId,
    });
  }
}

// ── Orders ────────────────────────────────────────────────

export async function listOrders(): Promise<Order[]> {
  const [res, phones] = await Promise.all([
    tables().listRows({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: TABLES.sales,
      queries: [Query.limit(1000)],
    }),
    phoneByClientId(),
  ]);
  return (res.rows as Row[])
    .map((row) =>
      toOrder(row, row.clientId ? phones.get(String(row.clientId)) ?? "" : "")
    )
    .sort((a, b) =>
      String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""))
    );
}

export async function listOrderItems(): Promise<OrderItem[]> {
  const res = await tables().listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: TABLES.sales,
    queries: [Query.limit(1000)],
  });
  const items: OrderItem[] = [];
  for (const row of res.rows as Row[]) {
    parseItems(row.itemsJson).forEach((it, index) => {
      items.push({
        id: `${row.$id}-${index}`,
        order_id: row.$id,
        item_no: index + 1,
        name: String(it.name ?? ""),
        qty: Number(it.quantity ?? 0),
        rate: Number(it.price ?? 0),
        amount: Number(it.total ?? 0),
      });
    });
  }
  return items;
}

export async function createOrder(data: {
  customer_id: string | null;
  customer_name: string;
  phone: string;
  total: number;
}): Promise<{ id: string }> {
  const row = await tables().createRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: TABLES.sales,
    rowId: ID.unique(),
    data: {
      localId: ID.unique(),
      invoiceNo: `INV-${Date.now()}`,
      createdAt: new Date().toISOString(),
      total: data.total,
      totalQuantity: 0,
      itemCount: 0,
      itemsJson: "[]",
      clientId: data.customer_id ?? null,
      clientName: data.customer_name,
    },
  });
  return { id: row.$id };
}

export async function createOrderItems(
  rows: {
    order_id: string;
    product_id: string;
    item_no: number;
    name: string;
    qty: number;
    rate: number;
    amount: number;
  }[]
): Promise<void> {
  const byOrder = new Map<string, typeof rows>();
  for (const row of rows) {
    const key = String(row.order_id);
    const list = byOrder.get(key) ?? [];
    list.push(row);
    byOrder.set(key, list);
  }
  await Promise.all(
    [...byOrder.entries()].map(async ([orderId, lines]) => {
      const sale = await tables().getRow({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: TABLES.sales,
        rowId: orderId,
      });
      const merged = [
        ...parseItems(sale.itemsJson),
        ...lines.map((l) => ({
          productId: l.product_id,
          name: l.name,
          price: l.rate,
          quantity: l.qty,
          total: l.amount,
        })),
      ];
      await tables().updateRow({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: TABLES.sales,
        rowId: orderId,
        data: {
          itemsJson: JSON.stringify(merged),
          totalQuantity: merged.reduce(
            (sum, it) => sum + Number(it.quantity ?? 0),
            0
          ),
          itemCount: merged.length,
          total: merged.reduce((sum, it) => sum + Number(it.total ?? 0), 0),
        },
      });
    })
  );
}

export async function deleteOrdersWithItems(ids: string[]): Promise<void> {
  await Promise.all(
    ids.map((id) =>
      tables().deleteRow({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: TABLES.sales,
        rowId: id,
      })
    )
  );
}

// Single-order read used by the WhatsApp sender API route.
export async function getOrderDetails(orderId: string): Promise<{
  order: {
    id: string;
    customer_id: string | null;
    customer_name: string;
    phone: string;
    total: number;
  };
  items: { name: string; qty: number; amount: number }[];
  address: { address: string; pincode: string } | null;
} | null> {
  let sale: Row;
  try {
    sale = (await tables().getRow({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: TABLES.sales,
      rowId: orderId,
    })) as Row;
  } catch {
    return null;
  }

  let phone = "";
  const address: { address: string; pincode: string } | null = null;
  if (sale.clientId) {
    try {
      const client = (await tables().getRow({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: TABLES.clients,
        rowId: String(sale.clientId),
      })) as Row;
      phone = String(client.phone ?? "");
    } catch {
      // client row missing — leave defaults
    }
  }

  return {
    order: {
      id: sale.$id,
      customer_id: (sale.clientId as string | null) ?? null,
      customer_name: String(sale.clientName ?? ""),
      phone,
      total: Number(sale.total ?? 0),
    },
    items: parseItems(sale.itemsJson).map((it) => ({
      name: String(it.name ?? ""),
      qty: Number(it.quantity ?? 0),
      amount: Number(it.total ?? 0),
    })),
    address,
  };
}

export type BillItem = {
  item_no: number;
  name: string;
  qty: number;
  rate: number;
  amount: number;
};

export type ShopDetails = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  phoneNumber: string;
  upiId: string;
  footerText: string;
};

// Read-only storefront config from the one-row "shop" table.
export async function getShopDetails(): Promise<ShopDetails> {
  const res = await tables().listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: TABLES.shop,
    queries: [Query.limit(1)],
  });
  const row = (res.rows as Row[])[0];
  return {
    name: row ? String(row.name ?? "") : "Golden Sparks",
    addressLine1: row ? String(row.addressLine1 ?? "") : "",
    addressLine2: row ? String(row.addressLine2 ?? "") : "",
    phoneNumber: row ? String(row.phoneNumber ?? "") : "",
    upiId: row ? String(row.upiId ?? "") : "",
    footerText: row
      ? String(row.footerText ?? "")
      : "Thank you, Visit again!!!",
  };
}

// Everything the printable bill needs for one sale. Bills are derived from a
// sale automatically, so every order has one without any extra setup.
export async function getBill(orderId: string): Promise<{
  order: {
    id: string;
    invoiceNo: string;
    customer_name: string;
    phone: string;
    total: number;
    createdAt: string;
  };
  items: BillItem[];
  shop: ShopDetails;
} | null> {
  let sale: Row;
  try {
    sale = (await tables().getRow({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: TABLES.sales,
      rowId: orderId,
    })) as Row;
  } catch {
    return null;
  }

  let phone = "";
  if (sale.clientId) {
    try {
      const client = (await tables().getRow({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: TABLES.clients,
        rowId: String(sale.clientId),
      })) as Row;
      phone = String(client.phone ?? "");
    } catch {
      // client row missing — leave empty
    }
  }

  const items = parseItems(sale.itemsJson).map((it, index) => ({
    item_no: index + 1,
    name: String(it.name ?? ""),
    qty: Number(it.quantity ?? 0),
    rate: Number(it.price ?? 0),
    amount: Number(it.total ?? 0),
  }));

  return {
    order: {
      id: sale.$id,
      invoiceNo: String(sale.invoiceNo ?? `INV-${sale.$id}`),
      customer_name: String(sale.clientName ?? ""),
      phone,
      total: Number(sale.total ?? 0),
      createdAt: String(sale.createdAt ?? sale.$createdAt ?? ""),
    },
    items,
    shop: await getShopDetails(),
  };
}
