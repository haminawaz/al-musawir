import type { RequestHandler } from "express";
import { HttpError } from "../lib/errors.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * CSRF protection for cookie-authenticated requests: a browser always sends Origin on cross-site
 * POST/PUT/PATCH/DELETE, so a change from any origin not on the list is refused.
 * Requests without Origin are not from a browser page (curl, server-to-server) and carry no ambient cookie risk.
 * The session cookie's SameSite setting is a second layer.
 */
export function requireTrustedOrigin(allowedOrigins: string[]): RequestHandler {
  const allowed = new Set(allowedOrigins);
  return (req, _res, next) => {
    if (SAFE_METHODS.has(req.method)) return next();
    const origin = req.get("origin");
    if (!origin || allowed.has(origin)) return next();
    next(new HttpError(403, "Changes are only accepted from the admin dashboard."));
  };
}

/**
 * Bodies must be JSON. HTML forms can only send form-encoded or text bodies, so this also closes the
 * classic form-post CSRF route.
 */
export const requireJsonBody: RequestHandler = (req, _res, next) => {
  const length = req.get("content-length");
  const hasBody = (length !== undefined && length !== "0") || req.get("transfer-encoding") !== undefined;
  if (!hasBody || req.is("application/json")) return next();
  next(new HttpError(415, "Send the request body as JSON (Content-Type: application/json)."));
};

/** Admin responses hold unpublished drafts and account details: never store them in a cache. */
export const noStore: RequestHandler = (_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
};
