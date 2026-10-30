import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GS_SESSION_COOKIE } from "@/lib/appwrite";

// Sends a test message to both store numbers (+91 83444 76962, +91 90876 06352)
// and the linked WhatsApp device, so the owner can confirm auto-send
// works end-to-end straight from the dashboard.
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

    const storeNumbers = (
      process.env.STORE_WHATSAPP_NUMBER ?? "919087606352,918344476962"
    )
      .split(",")
      .map((n) => n.replace(/\D/g, ""))
      .filter(Boolean);

    const selfNumber = String(status.number ?? "").replace(/\D/g, "");
    const targets = Array.from(new Set([...storeNumbers, selfNumber])).filter(
      (n) => n.length >= 10
    );

    if (targets.length === 0) {
      return NextResponse.json({ ok: false, error: "no-number" }, { status: 502 });
    }

    const message = `Golden Spark test ✅ WhatsApp auto-send is working (${new Date().toLocaleString(
      "en-IN",
      { timeZone: "Asia/Kolkata" }
    )}).`;

    const sendToOne = async (to: string, retries = 1): Promise<boolean> => {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 30000);
          try {
            const sendRes = await fetch(`${senderUrl}/send`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ to, message, secret }),
              signal: controller.signal,
            });
            if (sendRes.ok) {
              const body = (await sendRes.json()) as { ok?: boolean };
              if (body.ok === true) return true;
            }
          } finally {
            clearTimeout(timeout);
          }
        } catch (err) {
          console.warn(`[wa-test] Attempt ${attempt + 1} failed for ${to}:`, err);
        }
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 1500));
        }
      }
      return false;
    };

    const results: Record<string, boolean> = {};
    for (const to of targets) {
      results[to] = await sendToOne(to);
      await new Promise((r) => setTimeout(r, 800));
    }

    const anySent = Object.values(results).some(Boolean);
    if (!anySent) {
      return NextResponse.json(
        { ok: false, error: "send-failed", results },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, targets, results });
  } catch {
    return NextResponse.json({ ok: false, error: "unreachable" }, { status: 502 });
  }
}
