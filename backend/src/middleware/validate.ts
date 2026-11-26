import type { Request, RequestHandler } from "express";
import type { z } from "zod";
import { HttpError, ValidationError } from "../lib/errors.js";

/** A named route parameter (e.g. :slug) as a string. */
export function routeParam(req: Request, name: string): string {
  const value: unknown = req.params[name];
  if (typeof value !== "string") throw new HttpError(404, `Missing :${name} in the address.`);
  return value;
}
import { formatIssues } from "../lib/validation.js";

/**
 * Checks req.body against a schema and replaces it with the parsed value.
 * Unknown fields are dropped, so nothing that is not in the schema reaches the database.
 */
export function validateBody(schema: z.ZodType): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) return next(new ValidationError(formatIssues(result.error)));
    req.body = result.data;
    next();
  };
}

/** Parses a value (params, query) or throws a 422 with readable problems. */
export function parseOrThrow<S extends z.ZodType>(schema: S, value: unknown, message?: string): z.output<S> {
  const result = schema.safeParse(value);
  if (!result.success) throw new ValidationError(formatIssues(result.error), message);
  return result.data;
}
