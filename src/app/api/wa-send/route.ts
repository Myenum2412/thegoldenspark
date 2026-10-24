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

    // Orders go to the store number(s) so the owner gets every order.
    // Multiple numbers can be configured, comma separated — every order
    // is sent to each of them.
    const storeNumbers = (
      process.env.STORE_WHATSAPP_NUMBER ?? "919087606352,918344476962"
    )
      .split(",")
      .map((n) => n.replace(/\D/g, ""))
      .filter(Boolean);

    const sendToOne = async (to: string): Promise<boolean> => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        try {
          const sendRes = await fetch(`${senderUrl}/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ to, message, secret: senderSecret }),
            signal: controller.signal,
          });
          if (!sendRes.ok) return false;
          const body = (await sendRes.json()) as { ok?: boolean };
          return body.ok === true;
        } finally {
          clearTimeout(timeout);
        }
      } catch {
        return false;
      }
    };

    const results = await Promise.all(storeNumbers.map(sendToOne));
    return NextResponse.json({ sent: results.some(Boolean) });
  } catch {
    return NextResponse.json({ sent: false });
  }
}
