// Renders the 1200×630 link-preview images (public/og/<lang>.png) with the
// site's own icon, flags and words. Run after `npm run build`, when the images'
// text or design changes (they're committed, not built on every deploy):
//
//   npx -y -p playwright-core node scripts/og-images.mjs
//
// Uses the Chrome installed on this machine.
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { ogText } = await import(join(root, "dist-ssr", "entry-server.js"));
const LOCALES = ["en", "de", "fr", "es", "it", "zh", "ja", "ko", "tl"];
const FLAGS = ["jp", "br", "ke", "is", "ca", "kr", "mx"];
const data = (file, type) => `data:${type};base64,${readFileSync(join(root, "public", file)).toString("base64")}`;
const icon = data("icon-512.png", "image/png");
const font = pathToFileURL(join(root, "node_modules/@fontsource-variable/nunito/files/nunito-latin-wght-normal.woff2")).href;

const page = (t) => `<!doctype html><html lang="${t.lang}"><head><meta charset="utf-8"><style>
@font-face { font-family: Nunito; src: url(${font}) format("woff2"); font-weight: 200 1000; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; overflow: hidden; font-family: Nunito, "PingFang SC", "Apple SD Gothic Neo", sans-serif; color: white;
  background: linear-gradient(160deg, #0f1629, #1a2444 60%, #1e2f5c); position: relative; }
.glow { position: absolute; right: -120px; top: -160px; width: 620px; height: 620px; border-radius: 50%; background: radial-gradient(circle, rgb(107 77 199 / .45), transparent 70%); }
svg.land { position: absolute; bottom: 0; left: 0; width: 1200px; height: 230px; }
.content { position: absolute; left: 80px; top: 92px; right: 80px; }
.brand { display: flex; align-items: center; gap: 28px; }
.brand img { width: 132px; height: 132px; border-radius: 30px; box-shadow: 0 12px 40px rgb(0 0 0 / .35); }
h1 { font-size: 88px; font-weight: 800; letter-spacing: -1px; }
p { margin-top: 28px; font-size: 40px; font-weight: 600; color: rgb(255 255 255 / .82); max-width: 980px; }
.pills { margin-top: 26px; display: flex; gap: 14px; }
.pill { padding: 10px 22px; border-radius: 999px; font-size: 26px; font-weight: 700; background: rgb(255 255 255 / .12); }
.pill.gold { background: linear-gradient(90deg, #f2732f, #d9405a); }
.flags { position: absolute; right: 80px; bottom: 56px; display: flex; gap: 12px; }
.flags img { width: 64px; height: 48px; border-radius: 6px; box-shadow: 0 4px 12px rgb(0 0 0 / .4); }
.url { position: absolute; left: 80px; bottom: 60px; font-size: 30px; font-weight: 700; color: rgb(255 255 255 / .7); }
</style></head><body>
<div class="glow"></div>
<svg class="land" viewBox="0 0 1200 230" preserveAspectRatio="none">
  <path d="M0 230 L0 120 L140 60 L260 140 L420 30 L560 130 L700 70 L860 150 L1000 50 L1200 130 L1200 230 Z" fill="rgb(66 87 143 / .35)"/>
  <path d="M0 230 L0 170 C200 120 300 190 500 160 C700 130 800 200 1000 160 C1100 140 1150 170 1200 165 L1200 230 Z" fill="rgb(36 51 97 / .8)"/>
</svg>
<div class="content">
  <div class="brand"><img src="${icon}"><h1>Cartographer</h1></div>
  <p>${t.tagline}</p>
  <div class="pills"><span class="pill gold">📅 ${t.daily}</span><span class="pill">📖 ${t.quizzes}</span></div>
</div>
<div class="url">cartographerquiz.com</div>
<div class="flags">${FLAGS.map((f) => `<img src="${data(`flags/${f}.svg`, "image/svg+xml")}">`).join("")}</div>
</body></html>`;

const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } });
mkdirSync(join(root, "public", "og"), { recursive: true });
for (const code of LOCALES) {
  await tab.setContent(page(ogText(code)), { waitUntil: "load" });
  await tab.evaluate(() => document.fonts.ready);
  await tab.screenshot({ path: join(root, "public", "og", `${code}.png`) });
  console.log(`og-images: public/og/${code}.png`);
}
await browser.close();
