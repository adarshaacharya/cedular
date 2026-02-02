import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const authPages = ["/login", "/signup"];
const marketingPages = ["/", "/privacy", "/terms"];
/**
 * Better Auth Proxy for Next.js
 *
 * SECURITY WARNING: getSessionCookie() only checks for cookie existence,
 * it does NOT validate the session. Always validate sessions on the server
 * for protected actions/pages using auth.api.getSession()
 *
 * This proxy is for optimistic redirection only, not security.
 */
export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  const publicPages = [...authPages, ...marketingPages];

  // Redirect authenticated users away from auth pages
  if (sessionCookie && publicPages.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect dashboard routes
  if (!sessionCookie && !publicPages.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|\\.well-known/workflow|.*\\.(?:svg|png|jpg|jpeg|gif|webp|html)$).*)",
  ],
};

/**
 * ALTERNATIVE APPROACHES:
 *
 * 1. Using getCookieCache (gets session from cookie cache):
 *    import { getCookieCache } from "better-auth/cookies";
 *    const session = await getCookieCache(request);
 *
 * 2. Using auth.api.getSession (Next.js 15.2.0+ with runtime: "nodejs"):
 *    import { auth } from "@/lib/auth";
 *    import { headers } from "next/headers";
 *    Add to config: runtime: "nodejs"
 *    const session = await auth.api.getSession({ headers: await headers() });
 *
 * Note: Using auth.api.getSession validates the session but blocks requests.
 * getSessionCookie is recommended for performance (non-blocking).
 */
