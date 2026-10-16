import { NextResponse } from "next/server";
import { getOrderDetails } from "@/lib/store.server";

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

    let details;
    try {
      details = await getOrderDetails(String(orderId));
    } catch {
      return NextResponse.json({ sent: false });
    }
    if (!details) return NextResponse.json({ sent: false });
    const { order, items, address } = details;

    const lines = items.map(
      (l) =>
        `${l.qty} x ${l.name} - ₹${Number(l.amount).toLocaleString("en-IN")}`
    );
    const message = [
      `New order #${order.id} — Golden Spark website:`,
      "",
      `Name: ${order.customer_name}`,
      `Phone: ${order.phone}`,
      address
        ? `Address: ${address.address}, ${address.pincode}`
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
      process.env.STORE_WHATSAPP_NUMBER ?? "919087606352"
    ).replace(/\D/g, "");
    const to = storeNumber;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
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
