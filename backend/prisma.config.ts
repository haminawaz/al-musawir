import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma CLI settings. Prisma 7 does not read .env by itself, hence the dotenv import above.
// DATABASE_URL may be missing for `prisma generate` (which never connects), for example in CI;
// commands that need the database report the missing URL themselves.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx src/scripts/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
