import { defineConfig } from "vitest/config";

// Unit tests need no database. tests/integration/* runs only when TEST_DATABASE_URL points at a
// migrated PostgreSQL database whose name contains "test" (it resets that database's content).
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 60_000,
    env: {
      NODE_ENV: "test",
      LOG_LEVEL: "silent",
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? "postgresql://unused:unused@127.0.0.1:1/unused_test",
      AUTH_SECRET: "test-only-secret-that-is-at-least-32-characters-long",
      ADMIN_CORS_ORIGINS: "http://localhost:3001",
      PUBLIC_CACHE_TTL_SECONDS: "60",
      LOGIN_RATE_LIMIT_PER_15_MINUTES: "1000",
      PUBLIC_RATE_LIMIT_PER_MINUTE: "10000",
      ADMIN_RATE_LIMIT_PER_MINUTE: "10000",
    },
  },
});
