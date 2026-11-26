import { defineConfig, devices } from "@playwright/test";

/**
 * UI tests run the real pages in Chromium against the in-browser simulation
 * of the native side (src/bridge/fake.ts). They verify the interface and the
 * drawing engine; Windows behaviour is verified separately by the app's
 * --self-test on the Windows CI runner.
 */
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 768 }, baseURL: "http://localhost:4173", trace: "off" },
  webServer: { command: "npx vite preview --port 4173 --strictPort", port: 4173, reuseExistingServer: true, timeout: 60_000 },
});
