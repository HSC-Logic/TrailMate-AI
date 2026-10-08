import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60000,
  use: { baseURL: "http://127.0.0.1:4173/TrailMate-AI/" },
  webServer: {
    command: "npm run preview -- --port 4173",
    url: "http://127.0.0.1:4173/TrailMate-AI/",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 } } },
  ],
});
