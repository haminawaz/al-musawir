import type { SessionUser } from "../types";

// Mock session: an HMAC-signed cookie, checked by src/proxy.ts and by every mock API route.
// Uses Web Crypto only, so it runs in the proxy and in route handlers alike.
// When the real backend arrives, it issues and checks the session instead, and this file goes away.

export const SESSION_COOKIE = "am_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

const DEV_SECRET = "dev-only-secret-do-not-use-in-production";
const encoder = new TextEncoder();

/** Missing in production means sign-in is refused (see /api/auth/login). */
export function authSecret() {
  return process.env.AUTH_SECRET || (process.env.NODE_ENV === "production" ? undefined : DEV_SECRET);
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string) {
  const binary = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function hmacKey(secret: string) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function createSessionToken(user: SessionUser) {
  const secret = authSecret();
  if (!secret) throw new Error("AUTH_SECRET is not set.");
  const payload = toBase64Url(
    encoder.encode(JSON.stringify({ ...user, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE })),
  );
  const signature = await crypto.subtle.sign("HMAC", await hmacKey(secret), encoder.encode(payload));
  return `${payload}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifySessionToken(token: string | undefined): Promise<SessionUser | null> {
  const secret = authSecret();
  if (!token || !secret) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra !== undefined) return null;
  try {
    const valid = await crypto.subtle.verify("HMAC", await hmacKey(secret), fromBase64Url(signature), encoder.encode(payload));
    if (!valid) return null;
    const data = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    if (typeof data.exp !== "number" || data.exp < Date.now() / 1000) return null;
    if (typeof data.email !== "string" || typeof data.name !== "string") return null;
    return { email: data.email, name: data.name };
  } catch {
    return null;
  }
}
