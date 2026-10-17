import { defineConfig } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3000);
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  fullyParallel: true,
  use: { baseURL },
  webServer: {
    command: `node node_modules/next/dist/bin/next start --port ${port}`,
    // Serwis jest ZAMKNIĘTY DOMYŚLNIE (patrz src/proxy.ts). Bez tego serwer
    // testowy oddawałby stronę zamknięcia z kodem 503 i padłby każdy test —
    // sprawdzamy serwis, nie blokadę.
    env: { SITE_LOCK: "off" },
    url: `${baseURL}/pl`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
