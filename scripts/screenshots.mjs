import process from "node:process";
import { chromium } from "@playwright/test";
const browser = await chromium.launch();
for (const [name, width, height] of [
  ["desktop", 1440, 1100],
  ["mobile", 390, 844],
]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.addInitScript(() => globalThis.localStorage.setItem("onboarded", "yes"));
  await page.goto(process.env.PREVIEW_URL || "http://127.0.0.1:4173/TrailMate-AI/");
  await page
    .getByRole("heading", { name: "Explore more. Scroll less." })
    .waitFor();
  await page.screenshot({ path: `docs/${name}.png`, fullPage: true });
  await page.close();
}
await browser.close();
