import { rateLimit, type Options } from "express-rate-limit";
import { env } from "../config/env.js";
import { HttpError } from "../lib/errors.js";

// Limits are counted in memory, per instance. Behind a load balancer, set TRUST_PROXY so the
// client's IP is used, not the balancer's. With several instances, use a shared store (e.g. Redis).

function limiter(windowMs: number, limit: number, message: string, extra: Partial<Options> = {}) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_req, _res, next) => next(new HttpError(429, message)),
    ...extra,
  });
}

const FIFTEEN_MINUTES = 15 * 60_000;
const TOO_MANY_LOGINS = "Too many sign-in attempts. Wait 15 minutes and try again.";

export const publicRateLimit = limiter(60_000, env.PUBLIC_RATE_LIMIT_PER_MINUTE, "Too many requests. Try again in a minute.");

export const adminRateLimit = limiter(60_000, env.ADMIN_RATE_LIMIT_PER_MINUTE, "Too many requests. Try again in a minute.");

/**
 * Failed sign-ins only (a correct one never counts), limited per IP and in total.
 * The total cap stops guessing spread over many addresses: there is one account, so many failures
 * from anywhere means an attack. Signed-in sessions keep working while it is in effect.
 */
export const loginRateLimitPerIp = limiter(FIFTEEN_MINUTES, env.LOGIN_RATE_LIMIT_PER_15_MINUTES, TOO_MANY_LOGINS, {
  skipSuccessfulRequests: true,
});

export const loginRateLimitTotal = limiter(FIFTEEN_MINUTES, env.LOGIN_GLOBAL_RATE_LIMIT_PER_15_MINUTES, TOO_MANY_LOGINS, {
  skipSuccessfulRequests: true,
  keyGenerator: () => "all",
});
