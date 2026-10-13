import { type NextRequest, NextResponse } from "next/server";

// Next.js 16 renamed Middleware to Proxy (same behaviour). Kept dependency-free
// on purpose: proxy runs before every matched request, so it only reads the
// app-domain session cookie set by /api/auth/login.
const SESSION_COOKIE = "gs_session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = request.cookies.has(SESSION_COOKIE);

  if (!authed && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (!authed && pathname.startsWith("/api/store")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
