import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

// Runs against a live Supabase (local: `npm run db:start`). Reads .env.local.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    env: loadEnv("development", process.cwd(), ""),
    include: ["tests/integration/**/*.test.ts"],
    testTimeout: 20_000,
    fileParallelism: false,
  },
});
