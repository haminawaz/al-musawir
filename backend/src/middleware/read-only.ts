import type { RequestHandler } from "express";
import { HttpError } from "../lib/errors.js";

const READ_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const ALLOW = "GET, HEAD, OPTIONS";

/**
 * First gate of the public API: anything other than GET (plus HEAD, and OPTIONS for CORS preflight)
 * is refused with 405 before routing, body parsing or any database access.
 */
export const allowReadsOnly: RequestHandler = (req, res, next) => {
  if (READ_METHODS.has(req.method)) return next();
  res.set("Allow", ALLOW);
  next(new HttpError(405, "This API is read-only. Only GET requests are allowed."));
};
