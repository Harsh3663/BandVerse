import os from "node:os";
import path from "node:path";

import { defineConfig } from "@playwright/test";

const port = 3000;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  forbidOnly: true,
  retries: 0,
  reporter: "list",
  outputDir: path.join(os.tmpdir(), "bandverse-playwright"),
  use: {
    baseURL: `http://localhost:${port}`,
    browserName: "chromium",
    channel: "msedge",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `npm run dev -- --port ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
