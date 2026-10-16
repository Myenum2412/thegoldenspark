import { NextResponse, type NextRequest } from "next/server";
import { GS_SESSION_COOKIE } from "@/lib/appwrite";
import * as store from "@/lib/store.server";

// All client data operations funnel through here. The API key stays on the
// server; the browser only needs its gs_session cookie.
const ACTIONS: Record<string, (payload: unknown) => Promise<unknown>> = {
  listProducts: () => store.listProducts(),
  listImages: () => store.listProductImages(),
  createProduct: (p) => store.createProduct(p as Parameters<typeof store.createProduct>[0]),
  updateProduct: (p) => {
    const { id, data } = p as { id: string; data: Parameters<typeof store.updateProduct>[1] };
    return store.updateProduct(id, data);
  },
  deleteProducts: (p) => store.deleteProducts(p as string[]),

  listCustomers: () => store.listCustomers(),
  createCustomer: (p) => store.createCustomer(p as Parameters<typeof store.createCustomer>[0]),
  deleteCustomersWithOrders: (p) => store.deleteCustomersWithOrders(p as string[]),

  listOrders: () => store.listOrders(),
  listOrderItems: () => store.listOrderItems(),
  createOrder: (p) => store.createOrder(p as Parameters<typeof store.createOrder>[0]),
  createOrderItems: (p) => store.createOrderItems(p as Parameters<typeof store.createOrderItems>[0]),
  deleteOrdersWithItems: (p) => store.deleteOrdersWithItems(p as string[]),
};

// Storefront checkout runs anonymously: visitors on / place orders without
// logging in. These three actions only create rows (never read or mutate
// existing data), so they are allowed without a session. Everything else
// (reads of customer/order data, product management, deletes) stays behind
// the admin gs_session cookie.
const PUBLIC_ACTIONS = new Set(["createCustomer", "createOrder", "createOrderItems"]);

export async function POST(req: NextRequest) {
  let action: string | undefined;
  let payload: unknown;
  try {
    ({ action, payload } = (await req.json()) as {
      action?: string;
      payload?: unknown;
    });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const handler = action ? ACTIONS[action] : undefined;
  if (!handler) {
    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }

  if ((!action || !PUBLIC_ACTIONS.has(action)) && !req.cookies.get(GS_SESSION_COOKIE)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await handler(payload);
    return NextResponse.json({ data: data ?? null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Store operation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
