import { NextResponse, type NextRequest } from "next/server";
import {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  GS_SESSION_COOKIE,
} from "@/lib/appwrite";

const MAX_AGE = 60 * 60 * 24 * 365;

// Pulls the non-legacy session cookie value out of an Appwrite response.
function readSessionValue(res: Response): string | null {
  const target = `a_session_${APPWRITE_PROJECT_ID}`;
  const cookies =
    typeof res.headers.getSetCookie === "function"
      ? res.headers.getSetCookie()
      : [res.headers.get("set-cookie") ?? ""];
  for (const raw of cookies) {
    if (!raw) continue;
    const [pair] = raw.split(";");
    const eq = pair.indexOf("=");
    if (eq === -1) continue;
    if (pair.slice(0, eq).trim() === target) return pair.slice(eq + 1).trim();
  }
  return null;
}

export async function POST(req: NextRequest) {
  let email: string | undefined;
  let password: string | undefined;
  try {
    ({ email, password } = (await req.json()) as {
      email?: string;
      password?: string;
    });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  let res: Response;
  try {
    res = await fetch(`${APPWRITE_ENDPOINT}/account/sessions/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": APPWRITE_PROJECT_ID,
      },
      body: JSON.stringify({ email: email.trim(), password }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Could not reach Appwrite (sfo.cloud.appwrite.io). Check your network, VPN or ad-blocker and try again.",
      },
      { status: 502 }
    );
  }

  if (!res.ok) {
    let message = "Invalid email or password.";
    try {
      const body = (await res.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      // keep the default message
    }
    return NextResponse.json({ error: message }, { status: 401 });
  }

  const value = readSessionValue(res);
  if (!value) {
    return NextResponse.json(
      { error: "Login succeeded but no session was returned by Appwrite." },
      { status: 502 }
    );
  }

  const out = NextResponse.json({ ok: true });
  out.cookies.set({
    name: GS_SESSION_COOKIE,
    value,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return out;
}
