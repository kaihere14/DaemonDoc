import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Dummy secrets so modules that read these at import time (crypto.js,
    // auth.middleware.js, github.service.js) never touch real credentials.
    env: {
      GITHUB_TOKEN_SECRET: "0".repeat(64),
      JWT_SECRET: "test-jwt-secret",
      GITHUB_WEBHOOK_SECRET: "test-webhook-secret",
    },
  },
});
