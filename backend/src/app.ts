import { randomUUID } from "node:crypto";
import compression from "compression";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { db } from "./db/client.js";
import { logger } from "./lib/logger.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { adminRouter } from "./routes/admin.js";
import { publicRouter } from "./routes/public.js";

/**
 *   /health        is the process up (no database)
 *   /health/ready  can it reach the database
 *   /api/v1/*      public website API: GET only, no sign-in
 *   /api/admin/*   admin dashboard API: signed-in admin only
 */
export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", env.TRUST_PROXY);
  app.set("query parser", "simple");

  app.use(
    pinoHttp({
      logger,
      genReqId: (req, res) => {
        const incoming = req.headers["x-request-id"];
        const id = typeof incoming === "string" && /^[\w-]{1,100}$/.test(incoming) ? incoming : randomUUID();
        res.setHeader("X-Request-Id", id);
        return id;
      },
      customLogLevel: (_req, res, err) => (err || res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info"),
      // One short line per request; headers (cookies included) are not logged.
      serializers: {
        req: (req: { id: unknown; method: string; url: string; remoteAddress?: string }) => ({
          id: req.id,
          method: req.method,
          url: req.url,
          ip: req.remoteAddress,
        }),
        res: (res: { statusCode: number }) => ({ status: res.statusCode }),
      },
      autoLogging: { ignore: (req) => req.url?.startsWith("/health") ?? false },
    }),
  );
  // JSON API: no HTML is served, so the defaults are fine; the public API is read from other origins.
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(compression());

  app.get("/health", (_req, res) => {
    res.set("Cache-Control", "no-store").json({ data: { status: "ok" } });
  });
  app.get("/health/ready", async (_req, res) => {
    await db.$queryRaw`SELECT 1`;
    res.set("Cache-Control", "no-store").json({ data: { status: "ok", database: "ok" } });
  });

  app.use("/api/v1", publicRouter());
  app.use("/api/admin", adminRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
