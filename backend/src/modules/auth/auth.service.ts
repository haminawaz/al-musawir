import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { env } from "../../config/env.js";
import { db } from "../../db/client.js";
import { HttpError } from "../../lib/errors.js";

// Sign-in for the one admin account.
//
// The session cookie is "<payload>.<signature>": the payload holds the admin id, the expiry time and a
// fingerprint of the current password hash, signed with HMAC-SHA256 and AUTH_SECRET. Nothing is stored
// per session. A cookie stops working when it expires, when the password changes (the fingerprint no
// longer matches), or when AUTH_SECRET changes.

const ADMIN_ID = 1;
const BCRYPT_COST = 12;
const SESSION_TTL_SECONDS = Math.round(env.SESSION_TTL_HOURS * 60 * 60);
const BAD_LOGIN = "That email and password do not match.";

/** What the dashboard receives from GET /auth/me and POST /auth/login. */
export type SessionUser = { email: string; name: string };

/** The signed-in admin, attached to the request by requireAuth. */
export type AuthenticatedAdmin = SessionUser & { id: number };

export const toSessionUser = (a: { email: string; name: string }): SessionUser => ({ email: a.email, name: a.name });

const sign = (value: string) => createHmac("sha256", env.AUTH_SECRET).update(value).digest("base64url");

/** Ties a cookie to the password it was issued under, without putting the hash itself in the cookie. */
const passwordFingerprint = (passwordHash: string) => sign(`password:${passwordHash}`).slice(0, 22);

function issueToken(admin: { id: number; passwordHash: string }) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = Buffer.from(JSON.stringify({ sub: admin.id, exp, pwd: passwordFingerprint(admin.passwordHash) })).toString("base64url");
  return { token: `${payload}.${sign(payload)}`, expiresAt: new Date(exp * 1000) };
}

/** The payload of a correctly signed, unexpired token; null otherwise. */
function readToken(token: string): { sub: number; pwd: string } | null {
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra !== undefined) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof data !== "object" || data === null) return null;
    const { sub, exp, pwd } = data as Record<string, unknown>;
    if (typeof sub !== "number" || typeof exp !== "number" || typeof pwd !== "string") return null;
    if (exp <= Date.now() / 1000) return null;
    return { sub, pwd };
  } catch {
    return null;
  }
}

export const hashPassword = (password: string) => bcrypt.hash(password, BCRYPT_COST);

// Compared against when the email is wrong, so a wrong email takes as long as a wrong password
// and response times do not reveal the admin's email.
let dummyHash: Promise<string> | undefined;
const getDummyHash = () => (dummyHash ??= bcrypt.hash(randomBytes(16).toString("hex"), BCRYPT_COST));

export async function login(email: string, password: string) {
  const admin = await db.admin.findUnique({ where: { email } });
  const passwordOk = await bcrypt.compare(password, admin?.passwordHash ?? (await getDummyHash()));
  if (!admin || !passwordOk) throw new HttpError(401, BAD_LOGIN);
  return { ...issueToken(admin), user: toSessionUser(admin) };
}

/** The admin a session cookie belongs to, or null when the cookie is invalid, expired or outdated. */
export async function authenticate(token: string): Promise<AuthenticatedAdmin | null> {
  const claims = readToken(token);
  if (!claims) return null;
  const admin = await db.admin.findUnique({ where: { id: claims.sub } });
  if (!admin) return null;
  const current = Buffer.from(passwordFingerprint(admin.passwordHash));
  const given = Buffer.from(claims.pwd);
  if (current.length !== given.length || !timingSafeEqual(current, given)) return null;
  return { id: admin.id, email: admin.email, name: admin.name };
}

/**
 * Creates the admin account, or replaces its email, name and password.
 * A new password signs out every open session.
 */
export async function setAdmin(input: { email: string; name: string; password: string }) {
  const data = { email: input.email.trim().toLowerCase(), name: input.name.trim(), passwordHash: await hashPassword(input.password) };
  const existing = await db.admin.findUnique({ where: { id: ADMIN_ID }, select: { id: true } });
  await db.admin.upsert({ where: { id: ADMIN_ID }, create: { id: ADMIN_ID, ...data }, update: data });
  return existing ? ("updated" as const) : ("created" as const);
}

export async function adminExists() {
  return (await db.admin.count()) > 0;
}
