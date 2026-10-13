import { type NextRequest, NextResponse } from "next/server";
import { APPWRITE_SESSION_COOKIE } from "@/lib/appwrite";

export async function middleware(request: NextRequest) {
  // Appwrite web SDK persists the session in a cookie after login.
  // Protect dashboard routes at request time (redirects don't work
  // reliably from inside a Suspense boundary during prerendering).
  if (
    !request.cookies.has(APPWRITE_SESSION_COOKIE) &&
    request.nextUrl.pathname.startsWith("/dashboard")
  ) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
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
