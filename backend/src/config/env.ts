import "dotenv/config";
import { z } from "zod";

// Every environment variable the server reads, checked once at startup.
// A missing or malformed value stops the server with a readable message instead of failing later.
// .env.example lists them all with placeholder values.

const bool = z
  .enum(["true", "false", "1", "0"], { error: "must be true or false" })
  .transform((v) => v === "true" || v === "1");

const csv = z.string().transform((v) =>
  v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

const postgresUrl = z
  .string({ error: "is required" })
  .regex(/^postgres(ql)?:\/\//, { error: "must be a postgresql:// connection URL" });

/** Express "trust proxy": false, true, a hop count, or a list of addresses/subnets. */
const trustProxy = z.string().transform((v): boolean | number | string => {
  if (v === "true") return true;
  if (v === "false" || v === "") return false;
  if (/^\d+$/.test(v)) return Number(v);
  return v;
});

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    HOST: z.string().default("0.0.0.0"),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),

    DATABASE_URL: postgresUrl,
    /** Optional connection for the public API, e.g. a role with SELECT only, or a read replica. */
    DATABASE_READONLY_URL: postgresUrl.optional(),
    DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
    /** Opens public-API connections with default_transaction_read_only=on. Turn off only if your pooler rejects startup options. */
    PUBLIC_DB_READ_ONLY_SESSION: bool.default(true),

    TRUST_PROXY: trustProxy.default(false),
    BODY_LIMIT: z.string().default("256kb"),

    ADMIN_CORS_ORIGINS: csv.default(["http://localhost:3001"]),
    PUBLIC_CORS_ORIGINS: csv.default(["*"]),

    /** Signs the session cookie. Changing it signs the admin out everywhere. */
    AUTH_SECRET: z
      .string({ error: "is required (a long random string, e.g. `openssl rand -base64 48`)" })
      .min(32, { error: "must be at least 32 characters (e.g. `openssl rand -base64 48`)" }),
    SESSION_COOKIE_NAME: z
      .string()
      .regex(/^[A-Za-z0-9_-]+$/, { error: "may only use letters, numbers, _ and -" })
      .default("am_admin_session"),
    SESSION_TTL_HOURS: z.coerce.number().positive().max(24 * 30).default(8),
    COOKIE_SECURE: bool.optional(),
    COOKIE_SAMESITE: z.enum(["lax", "strict", "none"]).default("lax"),
    COOKIE_DOMAIN: z.string().optional(),

    PUBLIC_CACHE_TTL_SECONDS: z.coerce.number().int().min(0).max(86_400).default(60),

    /** The website's revalidation endpoint, e.g. https://example.com/api/revalidate. Optional. */
    WEBSITE_REVALIDATE_URL: z.url({ protocol: /^https?$/, error: "must be an http(s) URL" }).optional(),
    /** Shared with the website (its REVALIDATE_SECRET). */
    REVALIDATE_SECRET: z.string().min(32, { error: "must be at least 32 characters" }).optional(),

    PUBLIC_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().min(1).default(300),
    ADMIN_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().min(1).default(1000),
    LOGIN_RATE_LIMIT_PER_15_MINUTES: z.coerce.number().int().min(1).default(10),
    /** Failed sign-ins from all addresses together. There is one account, so many failures means an attack. */
    LOGIN_GLOBAL_RATE_LIMIT_PER_15_MINUTES: z.coerce.number().int().min(1).default(50),
  })
  .transform((env) => ({ ...env, COOKIE_SECURE: env.COOKIE_SECURE ?? env.NODE_ENV === "production" }))
  .superRefine((env, ctx) => {
    if (env.COOKIE_SAMESITE === "none" && !env.COOKIE_SECURE)
      ctx.addIssue({ code: "custom", path: ["COOKIE_SAMESITE"], message: "none requires COOKIE_SECURE=true (browsers reject it otherwise)" });
    if (env.ADMIN_CORS_ORIGINS.includes("*"))
      ctx.addIssue({ code: "custom", path: ["ADMIN_CORS_ORIGINS"], message: "cannot be * because admin requests carry the session cookie; list the dashboard's origins" });
    if (env.NODE_ENV === "production" && !env.COOKIE_SECURE)
      ctx.addIssue({ code: "custom", path: ["COOKIE_SECURE"], message: "must be true in production" });
    if (!!env.WEBSITE_REVALIDATE_URL !== !!env.REVALIDATE_SECRET)
      ctx.addIssue({ code: "custom", path: ["REVALIDATE_SECRET"], message: "set both WEBSITE_REVALIDATE_URL and REVALIDATE_SECRET, or neither" });
  });

export type Env = z.output<typeof schema>;

function load(): Env {
  // `NAME=` with nothing after it counts as not set, so it gets the default.
  const input = Object.fromEntries(Object.entries(process.env).filter(([, value]) => value !== ""));
  const result = schema.safeParse(input);
  if (result.success) return result.data;
  const problems = result.error.issues.map((i) => `  - ${i.path.join(".") || "env"}: ${i.message}`).join("\n");
  // The logger depends on env, so this one message goes straight to stderr.
  console.error(`Invalid environment configuration:\n${problems}\nSee .env.example.`);
  process.exit(1);
}

export const env = load();
export const isProduction = env.NODE_ENV === "production";
