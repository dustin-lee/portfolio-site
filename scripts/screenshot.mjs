/**
 * Captures the README screenshots from a running production build.
 *   npm run build && npm start &
 *   npm run screenshot
 * Run this on your own machine: webfonts must load or the type is wrong.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const URL = process.env.SHOT_URL ?? "http://127.0.0.1:3000/";
mkdirSync("docs/media", { recursive: true });

const browser = await chromium.launch();
const shots = [
  { file: "docs/media/site.png", width: 1440, height: 900 },
  { file: "docs/media/site-mobile.png", width: 420, height: 900 },
];

for (const { file, width, height } of shots) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: file });
  await page.close();
  console.log("wrote", file);
}
await browser.close();
