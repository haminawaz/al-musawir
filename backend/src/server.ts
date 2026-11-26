import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { disconnectDatabases } from "./db/client.js";
import { logger } from "./lib/logger.js";

const server = createApp().listen(env.PORT, env.HOST, () => {
  logger.info(`API listening on http://${env.HOST === "0.0.0.0" ? "localhost" : env.HOST}:${env.PORT}`);
});

// Finish in-flight requests, then close database pools, so deploys and restarts drop nothing.
let stopping = false;
function shutdown(signal: string) {
  if (stopping) return;
  stopping = true;
  logger.info(`${signal} received, shutting down`);
  const force = setTimeout(() => {
    logger.error("Shutdown took longer than 10s, exiting");
    process.exit(1);
  }, 10_000);
  force.unref();
  server.close(async () => {
    await disconnectDatabases();
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => logger.error({ err: reason }, "Unhandled promise rejection"));
