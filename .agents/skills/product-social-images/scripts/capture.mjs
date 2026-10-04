// Usage: node capture.mjs <url> <outDir>
// Saves hero.png (first viewport), full.png (whole page, sticky nav hidden), text.txt and links.txt.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const [url, outDir = "shots"] = process.argv.slice(2);
if (!url) {
  console.error("usage: node capture.mjs <url> <outDir>");
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${outDir}/hero.png` });

// Scroll slowly so scroll-triggered animations and lazy images load.
const height = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < height; y += 300) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(300);
}
await page.waitForTimeout(1500);

// Hide fixed/sticky headers so they don't repeat across the full-page capture.
await page.evaluate(() => {
  for (const el of document.querySelectorAll("*")) {
    const pos = getComputedStyle(el).position;
    if (pos === "fixed" || pos === "sticky") el.style.visibility = "hidden";
  }
});
await page.screenshot({ path: `${outDir}/full.png`, fullPage: true });

writeFileSync(
  `${outDir}/text.txt`,
  await page.evaluate(() => document.body.innerText),
);
writeFileSync(
  `${outDir}/links.txt`,
  (
    await page.evaluate(() => [
      ...new Set([...document.querySelectorAll("a")].map((a) => a.href)),
    ])
  ).join("\n"),
);

console.log(`page height ${height}px; saved to ${outDir}/`);
await browser.close();
