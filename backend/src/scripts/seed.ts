import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { z } from "zod";
import { db, disconnectDatabases } from "../db/client.js";
import { loadSeedData, seedContent } from "../db/seed.js";
import { HttpError } from "../lib/errors.js";
import { adminExists, setAdmin } from "../modules/auth/auth.service.js";
import { newPasswordSchema } from "../modules/auth/auth.schema.js";

// npm run db:seed                      fill empty tables from prisma/seed-data (safe to run again)
// npm run db:seed -- --reset           replace all website content with the files' content
// npm run db:seed -- --from <folder>   read the JSON from another folder,
//                                      e.g. ../admin-panel/src/mock/seed
//
// The admin account is created from ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME when there is none yet.
// To change it later, use `npm run admin:set`.

const DEFAULT_DIR = fileURLToPath(new URL("../../prisma/seed-data", import.meta.url));

async function seedAdmin() {
  if (await adminExists()) return "Admin account already set (change it with `npm run admin:set`).";
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password)
    return "No admin account yet: set ADMIN_EMAIL and ADMIN_PASSWORD in .env and run the seed again, or run `npm run admin:set`.";
  const emailOk = z.email().safeParse(email);
  if (!emailOk.success) throw new Error("ADMIN_EMAIL is not a valid email address.");
  const passwordOk = newPasswordSchema.safeParse(password);
  if (!passwordOk.success) throw new Error(`ADMIN_PASSWORD: ${passwordOk.error.issues[0]?.message}`);
  await setAdmin({ email, password, name: process.env.ADMIN_NAME?.trim() || "Admin" });
  return `Created the admin account for ${email}.`;
}

async function main() {
  const { values } = parseArgs({ options: { reset: { type: "boolean", default: false }, from: { type: "string" } } });
  const dir = values.from ?? DEFAULT_DIR;

  console.log(`Reading seed files from ${dir}`);
  const data = await loadSeedData(dir);
  const seeded = await seedContent(db, data, { reset: values.reset });

  if (values.reset) console.log("Reset: all website content replaced.");
  console.log(seeded.length ? `Seeded ${seeded.join(", ")}.` : "Content already present; nothing to add (use --reset to replace it).");
  console.log(await seedAdmin());
}

main()
  .catch((error: unknown) => {
    console.error(`Seed failed: ${(error as Error).message}`);
    if (error instanceof HttpError) for (const d of error.details) console.error(`  - ${d}`);
    process.exitCode = 1;
  })
  .finally(disconnectDatabases);
