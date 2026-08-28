import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

// Next loads .env files even when the parent environment is empty. Shadow their
// keys with dummy values without printing or using any existing secret values.
const env = {
  PATH: process.env.PATH,
  HOME: process.env.HOME,
  TMPDIR: process.env.TMPDIR,
};
for (const file of [
  ".env",
  ".env.local",
  ".env.production",
  ".env.production.local",
  ".env.example",
]) {
  if (!existsSync(file)) continue;
  for (const match of readFileSync(file, "utf8").matchAll(
    /^\s*(?:#\s*)?(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/gm,
  ))
    env[match[1]] = "test-only";
}
Object.assign(env, {
  NODE_ENV: "production",
  NEXT_TELEMETRY_DISABLED: "1",
  NEXT_PUBLIC_ANALYTICS_MODE: "disabled",
  META_PURCHASE_MODE: "disabled",
  GOOGLE_PURCHASE_MODE: "disabled",
  VERCEL_ENV: "preview",
  DATABASE_URL: "postgresql://test:test@127.0.0.1:1/test?connect_timeout=1",
  BETTER_AUTH_SECRET: "test-only-build-secret-at-least-thirty-two-characters",
  BETTER_AUTH_URL: "http://127.0.0.1:3000",
  NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3000",
  RESEND_API_KEY: "re_test_only",
  RESEND_FROM_EMAIL: "test@example.test",
  PINECONE_API_KEY: "test-only",
  PINECONE_INDEX_NAME: "test-only",
  INDEX_INIT_TIMEOUT: "1",
  UPSTASH_REDIS_REST_URL: "https://127.0.0.1:1",
  UPSTASH_REDIS_REST_TOKEN: "test-only",
  AI_GATEWAY_API_KEY: "test-only",
  OPENAI_API_KEY: "test-only",
});
const child = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "build", "--webpack"],
  { env, stdio: "inherit" },
);
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
