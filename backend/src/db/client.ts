import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env.js";
import { PrismaClient, type Prisma } from "../generated/prisma/client.js";

// Two database clients:
//   db      read-write, used by the admin API and the scripts
//   readDb  read-only, the only client the public API is given
//
// readDb is read-only in PostgreSQL itself, not just by convention: its connections open with
// default_transaction_read_only=on, so any INSERT/UPDATE/DELETE through it fails in the database.
// Point DATABASE_READONLY_URL at a role that only has SELECT (or at a read replica) for a second lock.

function createClient(connectionString: string, readOnly: boolean) {
  const adapter = new PrismaPg({
    connectionString,
    max: env.DATABASE_POOL_MAX,
    ...(readOnly ? { options: "-c default_transaction_read_only=on" } : {}),
  });
  return new PrismaClient({ adapter });
}

export const db = createClient(env.DATABASE_URL, false);

export const readDb = createClient(env.DATABASE_READONLY_URL ?? env.DATABASE_URL, env.PUBLIC_DB_READ_ONLY_SESSION);

/**
 * What read functions accept: the full client, the read-only client, or a transaction.
 * Writes always go through `db` (usually inside `db.$transaction`).
 */
export type DbClient = Prisma.TransactionClient;

export async function disconnectDatabases() {
  await Promise.allSettled([db.$disconnect(), readDb.$disconnect()]);
}
