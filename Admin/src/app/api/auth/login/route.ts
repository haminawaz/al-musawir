import type { NextRequest } from "next/server";
import { authSecret, createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth/session";
import { fail, ok, readJson } from "@/mock/http";

// Mock sign-in: one admin account from environment variables (defaults are for local development only).
const DEV_EMAIL = "admin@example.com";
const DEV_PASSWORD = "admin12345";

export async function POST(request: NextRequest) {
  const isProd = process.env.NODE_ENV === "production";
  const expectedEmail = (process.env.ADMIN_EMAIL || DEV_EMAIL).toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD || (isProd ? undefined : DEV_PASSWORD);
  if (!expectedPassword || !authSecret())
    return fail(500, "Sign-in is not set up on this server. Set ADMIN_PASSWORD and AUTH_SECRET.");

  const body = await readJson(request);
  const email = typeof body === "object" && body && "email" in body ? String(body.email).trim().toLowerCase() : "";
  const password = typeof body === "object" && body && "password" in body ? String(body.password) : "";
  if (!email || !password) return fail(422, "Enter your email and password.");
  if (email !== expectedEmail || password !== expectedPassword) return fail(401, "That email and password do not match.");

  const user = { email, name: process.env.ADMIN_NAME || "Admin" };
  const response = ok({ user });
  response.cookies.set(SESSION_COOKIE, await createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
