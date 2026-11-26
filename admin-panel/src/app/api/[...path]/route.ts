import type { NextRequest } from "next/server";
import { adminApiUrl } from "@/lib/backend";

// Forwards /api/* to the backend's admin API (API_URL/api/admin/*), both ways:
// the session cookie and the request's origin go to the backend; status, JSON and Set-Cookie come back.
// The backend does all checking (session, validation, origin), so this stays a thin pipe.

export const dynamic = "force-dynamic";

/** Request headers the backend needs. Everything else (host, connection, ...) is left out. */
const FORWARD_REQUEST = ["accept", "content-type", "cookie", "origin", "user-agent", "x-request-id"];
/** Response headers passed back to the browser. Content-Encoding is left out because fetch already decoded the body. */
const FORWARD_RESPONSE = ["content-type", "cache-control", "allow", "retry-after", "ratelimit", "ratelimit-policy", "x-request-id"];
const TIMEOUT_MS = 20_000;

const json = (status: number, error: string) =>
  Response.json({ error }, { status, headers: { "cache-control": "no-store" } });

type Context = { params: Promise<{ path: string[] }> };

async function forward(request: NextRequest, { params }: Context) {
  const { path } = await params;
  if (path.some((segment) => segment === "." || segment === ".." || segment === "")) return json(404, "Not found.");

  let target: string;
  try {
    target = adminApiUrl(`/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`);
  } catch (error) {
    console.error(error);
    return json(500, "The dashboard is not connected to the backend. Set API_URL.");
  }

  const headers = new Headers();
  for (const name of FORWARD_REQUEST) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  // The visitor's IP, for the backend's logs and sign-in limits.
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (clientIp) headers.set("x-forwarded-for", clientIp);

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    console.error(`Backend request failed: ${request.method} ${target}`, error);
    return json(502, "Cannot reach the server. Try again in a moment.");
  }

  const out = new Headers();
  for (const name of FORWARD_RESPONSE) {
    const value = upstream.headers.get(name);
    if (value) out.set(name, value);
  }
  for (const cookie of upstream.headers.getSetCookie()) out.append("set-cookie", cookie);

  const noBody = upstream.status === 204 || upstream.status === 304 || request.method === "HEAD";
  return new Response(noBody ? null : await upstream.arrayBuffer(), { status: upstream.status, headers: out });
}

export { forward as DELETE, forward as GET, forward as HEAD, forward as PATCH, forward as POST, forward as PUT };
