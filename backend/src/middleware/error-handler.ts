import type { ErrorRequestHandler, RequestHandler } from "express";
import { Prisma } from "../generated/prisma/client.js";
import { HttpError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

// Every error leaves the API in one shape: { error: "message", details?: ["problem", ...] }.

/** body-parser errors carry a `type` and a `status`. */
type BodyParserError = Error & { type?: string; status?: number };

function toHttpError(err: unknown): HttpError | null {
  if (err instanceof HttpError) return err;

  const bp = err as BodyParserError;
  if (bp?.type === "entity.parse.failed") return new HttpError(400, "The request body is not valid JSON.");
  if (bp?.type === "entity.too.large") return new HttpError(413, "The request body is too large.");
  if (bp?.type === "encoding.unsupported" || bp?.type === "charset.unsupported")
    return new HttpError(415, "Send the request body as UTF-8 JSON.");

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Constraint errors that slip past the services' own checks, e.g. two saves racing each other.
    if (err.code === "P2002") return new HttpError(409, "That value is already in use. Reload and try again.");
    if (err.code === "P2003") return new HttpError(409, "This is used by other content, so it cannot be changed or removed.");
    if (err.code === "P2025") return new HttpError(404, "That item no longer exists. Reload and try again.");
  }
  return null;
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const known = toHttpError(err);
  const status = known?.status ?? 500;

  if (status >= 500) logger.error({ err, method: req.method, url: req.originalUrl }, "Request failed");

  if (res.headersSent) return res.end();
  // Error responses are never cached, by this server's public cache or anyone else's.
  res.set("Cache-Control", "no-store");
  const body = known
    ? { error: known.message, ...(known.details.length ? { details: known.details } : {}) }
    : { error: "Something went wrong on the server. Try again in a moment." };
  res.status(status).json(body);
};

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new HttpError(404, `No endpoint at ${req.method} ${req.path}.`));
};
