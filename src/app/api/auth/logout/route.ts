import { NextResponse, type NextRequest } from "next/server";
import {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  GS_SESSION_COOKIE,
} from "@/lib/appwrite";

export async function POST(req: NextRequest) {
  const value = req.cookies.get(GS_SESSION_COOKIE)?.value;
  if (value) {
    try {
      await fetch(`${APPWRITE_ENDPOINT}/account/sessions/current`, {
        method: "DELETE",
        headers: {
          "X-Appwrite-Project": APPWRITE_PROJECT_ID,
          "X-Appwrite-Session": value,
        },
        cache: "no-store",
      });
    } catch {
      // Best effort — clear the local cookie regardless.
    }
  }

  const out = NextResponse.json({ ok: true });
  out.cookies.set({
    name: GS_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return out;
}
