import { NextResponse, type NextRequest } from "next/server";
import {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  GS_SESSION_COOKIE,
} from "@/lib/appwrite";

function clearCookie(res: NextResponse) {
  res.cookies.set({
    name: GS_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function GET(req: NextRequest) {
  const value = req.cookies.get(GS_SESSION_COOKIE)?.value;
  if (!value) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const res = await fetch(`${APPWRITE_ENDPOINT}/account`, {
      headers: {
        "X-Appwrite-Project": APPWRITE_PROJECT_ID,
        "X-Appwrite-Session": value,
      },
      cache: "no-store",
    });
    if (!res.ok) {
      const out = NextResponse.json({ user: null }, { status: 401 });
      clearCookie(out);
      return out;
    }
    const user = (await res.json()) as {
      $id: string;
      email: string;
      name: string;
    };
    return NextResponse.json({
      user: { id: user.$id, email: user.email, name: user.name },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 502 });
  }
}
