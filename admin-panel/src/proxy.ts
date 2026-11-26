import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

/** Reachable without signing in. GET /api/content is what the website will read. */
const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/logout", "/api/content"];

/**
 * Sends signed-out visitors to /login, and signed-in ones away from it.
 * Each mock API route checks the session again, so this is not the only gate.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const user = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/login" && user) return NextResponse.redirect(new URL("/dashboard", request.url));
  if (PUBLIC_PATHS.includes(pathname) || user) return NextResponse.next();

  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const login = new URL("/login", request.url);
  if (pathname !== "/" && pathname !== "/dashboard") login.searchParams.set("next", pathname + search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
