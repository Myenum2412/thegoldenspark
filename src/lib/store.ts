// Client-side data layer. Every call goes through the authenticated
// /api/store route handler, which performs the actual Appwrite TablesDB
// operations on the server (the API key never reaches the browser).
import type { Customer, Product } from "./store-data";
import type { Order, OrderItem } from "@/components/order-view";

async function call<T>(action: string, payload?: unknown): Promise<T> {
  const res = await fetch("/api/store", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload }),
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // non-JSON error body — keep the generic message
    }
    throw new Error(message);
  }
  const body = (await res.json()) as { data: T };
  return body.data;
}

// ── Products ──────────────────────────────────────────────

export function listProducts(): Promise<Product[]> {
  return call<Product[]>("listProducts");
}

export function createProduct(data: {
  item_no: number;
  name: string;
  category: string;
  packing: string;
  mrp: number;
  special_rate: number;
  stock: number;
}): Promise<void> {
  return call<void>("createProduct", data);
}

export function updateProduct(
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
  return call<void>("updateProduct", { id, data });
}

export function deleteProducts(ids: string[]): Promise<void> {
  return call<void>("deleteProducts", ids);
}

// ── Customers ─────────────────────────────────────────────

export function listCustomers(): Promise<Customer[]> {
  return call<Customer[]>("listCustomers");
}

export function createCustomer(data: {
  name: string;
  phone: string;
  address: string;
  pincode: string;
}): Promise<{ id: string }> {
  return call<{ id: string }>("createCustomer", data);
}

export function deleteCustomersWithOrders(ids: string[]): Promise<void> {
  return call<void>("deleteCustomersWithOrders", ids);
}

// ── Orders ────────────────────────────────────────────────

export function listOrders(): Promise<Order[]> {
  return call<Order[]>("listOrders");
}

export function listOrderItems(): Promise<OrderItem[]> {
  return call<OrderItem[]>("listOrderItems");
}

export function createOrder(data: {
  customer_id: string | null;
  customer_name: string;
  phone: string;
  total: number;
}): Promise<{ id: string }> {
  return call<{ id: string }>("createOrder", data);
}

export function createOrderItems(
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
  return call<void>("createOrderItems", rows);
}

export function deleteOrdersWithItems(ids: string[]): Promise<void> {
  return call<void>("deleteOrdersWithItems", ids);
}
