import { z } from "zod";

export const loginSchema = z.object(
  {
    email: z
      .string({ error: "Enter your email and password." })
      .trim()
      .toLowerCase()
      .min(1, { error: "Enter your email and password." })
      .max(254, { error: "That email and password do not match." }),
    // Upper bound keeps a huge body from tying up bcrypt; bcrypt only reads the first 72 bytes anyway.
    password: z
      .string({ error: "Enter your email and password." })
      .min(1, { error: "Enter your email and password." })
      .max(200, { error: "That email and password do not match." }),
  },
  { error: "Enter your email and password." },
);

export type LoginInput = z.output<typeof loginSchema>;

/** Rules for passwords set by the scripts (seed, admin:upsert). */
export const newPasswordSchema = z
  .string()
  .min(12, { error: "Password must be at least 12 characters." })
  .refine((v) => Buffer.byteLength(v, "utf8") <= 72, { error: "Password must be at most 72 bytes (bcrypt ignores the rest)." });
