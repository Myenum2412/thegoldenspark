import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GS_SESSION_COOKIE } from "@/lib/appwrite";

// Proxies the current WhatsApp link QR from the wa-sender service.
// Kept server-side so WA_SENDER_SECRET never reaches the browser.
export async function GET() {
  const store = await cookies();
  if (!store.has(GS_SESSION_COOKIE)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const senderUrl = process.env.WA_SENDER_URL;
  const secret = process.env.WA_SENDER_SECRET;
  if (!senderUrl || !secret) {
    return NextResponse.json(
      { ok: false, error: "not-configured" },
      { status: 503 }
    );
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    let res: Response;
    try {
      res = await fetch(
        `${senderUrl}/qr.png?secret=${encodeURIComponent(secret)}`,
        { cache: "no-store", signal: controller.signal }
      );
    } finally {
      clearTimeout(timeout);
    }

    // 204 = sender is up but has not produced a QR yet.
    if (res.status === 204) return new NextResponse(null, { status: 204 });
    // 409 = already linked; no QR to show.
    if (res.status === 409) {
      return NextResponse.json({ ok: false, ready: true }, { status: 409 });
    }
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: "sender-error" }, { status: 502 });
    }

    const body = await res.arrayBuffer();
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "unreachable" }, { status: 502 });
  }
}
