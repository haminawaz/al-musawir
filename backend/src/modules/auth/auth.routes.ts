import { Router } from "express";
import { env } from "../../config/env.js";
import { currentAdmin, requireAuth, sessionCookieOptions } from "../../middleware/auth.js";
import { loginRateLimitPerIp, loginRateLimitTotal } from "../../middleware/rate-limit.js";
import { validateBody } from "../../middleware/validate.js";
import { loginSchema, type LoginInput } from "./auth.schema.js";
import * as auth from "./auth.service.js";

// /api/admin/auth/*. Login and logout work without a session; /me needs one.
export const authRoutes = Router();

authRoutes.post("/login", loginRateLimitPerIp, loginRateLimitTotal, validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body as LoginInput;
  const session = await auth.login(email, password);
  res.cookie(env.SESSION_COOKIE_NAME, session.token, { ...sessionCookieOptions, expires: session.expiresAt });
  res.json({ data: { user: session.user } });
});

authRoutes.post("/logout", (_req, res) => {
  res.clearCookie(env.SESSION_COOKIE_NAME, sessionCookieOptions);
  res.json({ data: { signedOut: true } });
});

authRoutes.get("/me", requireAuth, (req, res) => {
  res.json({ data: { user: auth.toSessionUser(currentAdmin(req)) } });
});
