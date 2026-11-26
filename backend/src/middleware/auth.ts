import type { CookieOptions, Request, RequestHandler } from "express";
import { env } from "../config/env.js";
import { HttpError } from "../lib/errors.js";
import { authenticate, type AuthenticatedAdmin } from "../modules/auth/auth.service.js";

declare global {
  namespace Express {
    interface Request {
      /** Set by requireAuth. */
      admin?: AuthenticatedAdmin;
    }
  }
}

/** HTTP-only, so page scripts cannot read it; Secure and SameSite come from the environment. */
export const sessionCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAMESITE,
  path: "/",
  ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
};

export const readSessionToken = (req: Request): string | undefined => {
  const value: unknown = req.cookies?.[env.SESSION_COOKIE_NAME];
  return typeof value === "string" && value.length > 0 && value.length <= 500 ? value : undefined;
};

/** Lets the request through only with a valid session; otherwise 401, which sends the dashboard to sign-in. */
export const requireAuth: RequestHandler = async (req, res, next) => {
  const token = readSessionToken(req);
  const admin = token ? await authenticate(token) : null;
  if (!admin) {
    if (token) res.clearCookie(env.SESSION_COOKIE_NAME, sessionCookieOptions);
    return next(new HttpError(401, "Not signed in."));
  }
  req.admin = admin;
  next();
};

/** The signed-in admin. Use only in handlers behind requireAuth. */
export function currentAdmin(req: Request): AuthenticatedAdmin {
  if (!req.admin) throw new HttpError(401, "Not signed in.");
  return req.admin;
}
