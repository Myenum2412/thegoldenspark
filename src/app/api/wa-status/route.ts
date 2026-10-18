import { NextResponse } from "next/server";

// Reports whether the wa-sender service is configured, reachable and logged in.
export async function GET() {
  const senderUrl = process.env.WA_SENDER_URL;
  if (!senderUrl) {
    return NextResponse.json({
      configured: false,
      reachable: false,
      ready: false,
    });
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${senderUrl}/status`, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      return NextResponse.json({
        configured: true,
        reachable: false,
        ready: false,
      });
    }
    const body = (await res.json()) as { ready?: boolean; number?: string | null };
    return NextResponse.json({
      configured: true,
      reachable: true,
      ready: body.ready === true,
      number: body.number ?? null,
    });
  } catch {
    return NextResponse.json({
      configured: true,
      reachable: false,
      ready: false,
    });
  }
}
