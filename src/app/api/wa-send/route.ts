import { NextResponse } from "next/server";

// Called after a checkout succeeds. Reads the saved order and asks the
// persistent wa-sender service (whatsapp-web.js) to message the customer.
// Never throws — returns { sent: false } so the UI can fall back to wa.me.
export async function POST(req: Request) {
  try {
    const { orderId } = (await req.json()) as { orderId?: number | string };
    if (orderId == null) return NextResponse.json({ sent: false });

    const senderUrl = process.env.WA_SENDER_URL;
    const senderSecret = process.env.WA_SENDER_SECRET;
    if (!senderUrl || !senderSecret) {
      return NextResponse.json({ sent: false, reason: "not-configured" });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ sent: false });
    }
    const headers = {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    };

    const orderRes = await fetch(
      `${supabaseUrl}/rest/v1/orders?select=id,customer_id,customer_name,phone,total&id=eq.${orderId}&limit=1`,
      { headers, cache: "no-store" }
    );
    if (!orderRes.ok) return NextResponse.json({ sent: false });
    const orders = (await orderRes.json()) as {
      id: number;
      customer_id: number | null;
      customer_name: string;
      phone: string;
      total: number;
    }[];
    const order = orders[0];
    if (!order) return NextResponse.json({ sent: false });

    const itemsRes = await fetch(
      `${supabaseUrl}/rest/v1/order_items?select=name,qty,amount&order_id=eq.${order.id}&order=id`,
      { headers, cache: "no-store" }
    );
    const items = (
      itemsRes.ok ? await itemsRes.json() : []
    ) as { name: string; qty: number; amount: number }[];

    const addrRes = await fetch(
      `${supabaseUrl}/rest/v1/customers?select=address,pincode&id=eq.${order.customer_id}&limit=1`,
      { headers, cache: "no-store" }
    );
    const addrRows = (
      addrRes.ok ? await addrRes.json() : []
    ) as { address: string; pincode: string }[];
    const customerAddr = addrRows[0];

    const lines = items.map(
      (l) =>
        `${l.qty} x ${l.name} - ₹${Number(l.amount).toLocaleString("en-IN")}`
    );
    const message = [
      `New order #${order.id} — Golden Spark website:`,
      "",
      `Name: ${order.customer_name}`,
      `Phone: ${order.phone}`,
      customerAddr
        ? `Address: ${customerAddr.address}, ${customerAddr.pincode}`
        : "",
      "",
      ...lines,
      "",
      `Total: ₹${Number(order.total).toLocaleString("en-IN")}`,
    ]
      .filter((l) => l !== "")
      .join("\n");

    // Orders go to the store number so the owner gets every order.
    const storeNumber = (
      process.env.STORE_WHATSAPP_NUMBER ?? "918248601417"
    ).replace(/\D/g, "");
    const to = storeNumber;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let sendRes: Response;
    try {
      sendRes = await fetch(`${senderUrl}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, message, secret: senderSecret }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
    if (!sendRes.ok) return NextResponse.json({ sent: false });
    const body = (await sendRes.json()) as { ok?: boolean };
    return NextResponse.json({ sent: body.ok === true });
  } catch {
    return NextResponse.json({ sent: false });
  }
}
