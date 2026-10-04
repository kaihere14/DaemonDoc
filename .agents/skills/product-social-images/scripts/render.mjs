// Usage: node render.mjs <cardsDir>
// Renders every c*.html in cardsDir to cardsDir/out/<name>.png at 2x.
// Size comes from <body data-size="WxH">, default 1600x900.
import { chromium } from "playwright";
import { readdirSync, readFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const dir = resolve(process.argv[2] || ".");
mkdirSync(`${dir}/out`, { recursive: true });
const cards = readdirSync(dir)
  .filter((f) => /^c.*\.html$/.test(f))
  .sort();

const browser = await chromium.launch();
for (const file of cards) {
  const html = readFileSync(`${dir}/${file}`, "utf8").replace(
    /<!--[\s\S]*?-->/g,
    "",
  );
  const bodyTag = html.match(/<body[^>]*>/)?.[0] ?? "";
  const size = bodyTag.match(/data-size="(\d+)x(\d+)"/);
  const [width, height] = size
    ? [Number(size[1]), Number(size[2])]
    : [1600, 900];
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 2,
  });
  await page.goto(`file://${dir}/${file}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const name = file.replace(/\.html$/, ".png");
  await page.screenshot({ path: `${dir}/out/${name}` });
  console.log(`rendered out/${name} (${width}x${height} @2x)`);
  await page.close();
}
await browser.close();
