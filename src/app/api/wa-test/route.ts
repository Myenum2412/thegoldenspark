import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GS_SESSION_COOKIE } from "@/lib/appwrite";

// Sends a test message from the linked WhatsApp to itself, so the owner can
// confirm auto-send works end to end straight from the dashboard.
export async function POST() {
  const store = await cookies();
  if (!store.has(GS_SESSION_COOKIE)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const senderUrl = process.env.WA_SENDER_URL;
  const secret = process.env.WA_SENDER_SECRET;
  if (!senderUrl || !secret) {
    return NextResponse.json({ ok: false, error: "not-configured" }, { status: 503 });
  }

  try {
    const statusRes = await fetch(`${senderUrl}/status`, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const status = (await statusRes.json()) as {
      ready?: boolean;
      number?: string | null;
    };
    if (!status.ready) {
      return NextResponse.json({ ok: false, error: "not-linked" }, { status: 409 });
    }

    const to = String(status.number ?? "").replace(/\D/g, "");
    if (to.length < 10) {
      return NextResponse.json({ ok: false, error: "no-number" }, { status: 502 });
    }

    const message = `Golden Spark test ✅ WhatsApp auto-send is working (${new Date().toLocaleString(
      "en-IN"
    )}).`;
    const sendRes = await fetch(`${senderUrl}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, message, secret }),
      signal: AbortSignal.timeout(30000),
    });
    if (!sendRes.ok) {
      return NextResponse.json({ ok: false, error: "send-failed" }, { status: 502 });
    }
    const body = (await sendRes.json()) as { ok?: boolean };
    return NextResponse.json({ ok: body.ok === true, to });
  } catch {
    return NextResponse.json({ ok: false, error: "unreachable" }, { status: 502 });
  }
}
