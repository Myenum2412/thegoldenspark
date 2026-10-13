import { ID, Query } from "appwrite";
import type { Models } from "appwrite";
import {
  APPWRITE_DATABASE_ID,
  COLLECTIONS,
  assertAppwriteConfigured,
  databases,
} from "./appwrite";
import type { Customer, Product } from "./store-data";
import type { Order, OrderItem } from "@/components/order-view";

type Doc = Models.Document & { [key: string]: unknown };

const DB = () => {
  assertAppwriteConfigured();
  return APPWRITE_DATABASE_ID;
};

function toProduct(doc: Doc): Product {
  return {
    id: doc.$id,
    item_no: Number(doc.item_no ?? 0),
    name: String(doc.name ?? ""),
    category: String(doc.category ?? "General"),
    packing: String(doc.packing ?? "Box"),
    mrp: Number(doc.mrp ?? 0),
    special_rate: Number(doc.special_rate ?? 0),
    stock: Number(doc.stock ?? 0),
    created_at: doc.$createdAt,
  };
}

function toCustomer(doc: Doc): Customer {
  return {
    id: doc.$id,
    name: String(doc.name ?? ""),
    address: String(doc.address ?? ""),
    pincode: String(doc.pincode ?? ""),
    phone: String(doc.phone ?? ""),
    created_at: doc.$createdAt,
  };
}

function toOrder(doc: Doc): Order {
  return {
    id: doc.$id,
    customer_id: (doc.customer_id as string | null) ?? null,
    customer_name: String(doc.customer_name ?? ""),
    phone: String(doc.phone ?? ""),
    total: Number(doc.total ?? 0),
    status: String(doc.status ?? "new"),
    created_at: doc.$createdAt,
  };
}

function toOrderItem(doc: Doc): OrderItem {
  return {
    id: doc.$id,
    order_id: String(doc.order_id ?? ""),
    item_no: Number(doc.item_no ?? 0),
    name: String(doc.name ?? ""),
    qty: Number(doc.qty ?? 0),
    rate: Number(doc.rate ?? 0),
    amount: Number(doc.amount ?? 0),
  };
}

// ── Products ──────────────────────────────────────────────

export async function listProducts(): Promise<Product[]> {
  const res = await databases.listDocuments(DB(), COLLECTIONS.products, [
    Query.orderAsc("item_no"),
    Query.limit(200),
  ]);
  return res.documents.map(toProduct);
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
  await databases.createDocument(DB(), COLLECTIONS.products, ID.unique(), data);
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
  await databases.updateDocument(DB(), COLLECTIONS.products, id, data);
}

export async function deleteProducts(ids: string[]): Promise<void> {
  await Promise.all(
    ids.map((id) => databases.deleteDocument(DB(), COLLECTIONS.products, id))
  );
}

// ── Customers ─────────────────────────────────────────────

export async function listCustomers(): Promise<Customer[]> {
  const res = await databases.listDocuments(DB(), COLLECTIONS.customers, [
    Query.orderDesc("$createdAt"),
    Query.limit(200),
  ]);
  return res.documents.map(toCustomer);
}

export async function createCustomer(data: {
  name: string;
  phone: string;
  address: string;
  pincode: string;
}): Promise<{ id: string }> {
  const doc = await databases.createDocument(
    DB(),
    COLLECTIONS.customers,
    ID.unique(),
    data
  );
  return { id: doc.$id };
}

// Deletes customers plus their orders and order items first, so no
// orphaned rows are left behind.
export async function deleteCustomersWithOrders(
  ids: string[]
): Promise<void> {
  for (const customerId of ids) {
    const orders = await databases.listDocuments(DB(), COLLECTIONS.orders, [
      Query.equal("customer_id", customerId),
      Query.limit(500),
    ]);
    await deleteOrdersWithItems(orders.documents.map((o) => o.$id));
    await databases.deleteDocument(DB(), COLLECTIONS.customers, customerId);
  }
}

// ── Orders ────────────────────────────────────────────────

export async function listOrders(): Promise<Order[]> {
  const res = await databases.listDocuments(DB(), COLLECTIONS.orders, [
    Query.orderDesc("$createdAt"),
    Query.limit(200),
  ]);
  return res.documents.map(toOrder);
}

export async function listOrderItems(): Promise<OrderItem[]> {
  const res = await databases.listDocuments(DB(), COLLECTIONS.orderItems, [
    Query.limit(2000),
  ]);
  return res.documents.map(toOrderItem);
}

export async function createOrder(data: {
  customer_id: string | null;
  customer_name: string;
  phone: string;
  total: number;
}): Promise<{ id: string }> {
  const doc = await databases.createDocument(DB(), COLLECTIONS.orders, ID.unique(), {
    ...data,
    status: "new",
  });
  return { id: doc.$id };
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
  await Promise.all(
    rows.map((row) =>
      databases.createDocument(DB(), COLLECTIONS.orderItems, ID.unique(), row)
    )
  );
}

export async function deleteOrdersWithItems(ids: string[]): Promise<void> {
  for (const orderId of ids) {
    const items = await databases.listDocuments(DB(), COLLECTIONS.orderItems, [
      Query.equal("order_id", orderId),
      Query.limit(2000),
    ]);
    await Promise.all(
      items.documents.map((it) =>
        databases.deleteDocument(DB(), COLLECTIONS.orderItems, it.$id)
      )
    );
    await databases.deleteDocument(DB(), COLLECTIONS.orders, orderId);
  }
}

// Single-order read used by the WhatsApp sender API route.
export async function getOrderDetails(orderId: string): Promise<{
  order: { id: string; customer_id: string | null; customer_name: string; phone: string; total: number };
  items: { name: string; qty: number; amount: number }[];
  address: { address: string; pincode: string } | null;
} | null> {
  const orderDoc = await databases.getDocument(
    DB(),
    COLLECTIONS.orders,
    orderId
  );
  const itemsRes = await databases.listDocuments(DB(), COLLECTIONS.orderItems, [
    Query.equal("order_id", orderId),
    Query.limit(500),
  ]);
  let address: { address: string; pincode: string } | null = null;
  if (orderDoc.customer_id) {
    try {
      const customerDoc = await databases.getDocument(
        DB(),
        COLLECTIONS.customers,
        String(orderDoc.customer_id)
      );
      address = {
        address: String(customerDoc.address ?? ""),
        pincode: String(customerDoc.pincode ?? ""),
      };
    } catch {
      address = null;
    }
  }
  return {
    order: {
      id: orderDoc.$id,
      customer_id: (orderDoc.customer_id as string | null) ?? null,
      customer_name: String(orderDoc.customer_name ?? ""),
      phone: String(orderDoc.phone ?? ""),
      total: Number(orderDoc.total ?? 0),
    },
    items: itemsRes.documents.map((d) => ({
      name: String(d.name ?? ""),
      qty: Number(d.qty ?? 0),
      amount: Number(d.amount ?? 0),
    })),
    address,
  };
}
