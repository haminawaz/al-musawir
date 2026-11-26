import type { RequestHandler } from "express";
import { env } from "../config/env.js";
import { ResponseCache } from "../lib/response-cache.js";

const ttl = env.PUBLIC_CACHE_TTL_SECONDS;

/** Shared by the public API (fills it) and the admin API (clears it after every change). */
export const publicCache = new ResponseCache(ttl * 1000);

const cacheControl = ttl > 0 ? `public, max-age=${ttl}, stale-while-revalidate=${ttl * 5}` : "no-cache";

/**
 * Answers repeat GETs from memory, and tells browsers and CDNs how long they may keep a response.
 * Express adds an ETag to every response, so a client that already has the same content gets a
 * 304 with no body.
 */
export const cachePublicResponses: RequestHandler = (req, res, next) => {
  res.set("Cache-Control", cacheControl);
  if (!publicCache.enabled || (req.method !== "GET" && req.method !== "HEAD")) return next();

  const key = req.originalUrl;
  const hit = publicCache.get(key);
  if (hit !== undefined) {
    res.set("X-Cache", "HIT");
    res.type("application/json").send(hit);
    return;
  }

  res.set("X-Cache", "MISS");
  const json = res.json.bind(res);
  res.json = (body: unknown) => {
    if (res.statusCode === 200) {
      const serialized = JSON.stringify(body);
      publicCache.set(key, serialized);
      return res.type("application/json").send(serialized);
    }
    return json(body);
  };
  next();
};
