import { NextResponse, type NextRequest } from "next/server";
import { adminApiUrl } from "@/lib/backend";

// Sends signed-out visitors to /login, and signed-in ones away from it, by asking the backend
// whether the session cookie is valid. (Next.js 16 calls middleware "proxy".)
// This only decides which page to show: every API request is checked again by the backend.

type Session = { signedIn: boolean; setCookie: string[] };

/** null when the backend cannot be reached, so the answer is unknown. */
async function checkSession(request: NextRequest): Promise<Session | null> {
  const cookie = request.headers.get("cookie");
  if (!cookie) return { signedIn: false, setCookie: [] };
  try {
    const res = await fetch(adminApiUrl("/auth/me"), {
      headers: { cookie, accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
    // On 401 the backend also clears a bad cookie; pass that on.
    if (res.status === 401) return { signedIn: false, setCookie: res.headers.getSetCookie() };
    return res.ok ? { signedIn: true, setCookie: [] } : null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await checkSession(request);

  // Backend down: show the page anyway. Its data requests fail with a clear message, and the data
  // itself stays protected by the backend.
  if (!session) return NextResponse.next();

  if (pathname === "/login") return session.signedIn ? NextResponse.redirect(new URL("/dashboard", request.url)) : NextResponse.next();
  if (session.signedIn) return NextResponse.next();

  const login = new URL("/login", request.url);
  if (pathname !== "/" && pathname !== "/dashboard") login.searchParams.set("next", pathname + search);
  const response = NextResponse.redirect(login);
  for (const cookie of session.setCookie) response.headers.append("set-cookie", cookie);
  return response;
}

export const config = {
  // Pages only: /api is forwarded to the backend, which checks the session itself.
  matcher: ["/((?!api/|_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
