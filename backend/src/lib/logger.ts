import { pino } from "pino";
import { env } from "../config/env.js";

/** JSON logs in production; readable lines in development. Session cookies never reach the log. */
export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: ["req.headers.cookie", "req.headers.authorization", 'res.headers["set-cookie"]', "password", "*.password"],
    censor: "[redacted]",
  },
  ...(env.NODE_ENV === "development" ? { transport: { target: "pino-pretty", options: { ignore: "pid,hostname" } } } : {}),
});
