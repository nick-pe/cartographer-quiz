// Writes a finished HTML file for every page in every language (dist/fr/quiz/rivers.html…),
// using the server build of the app (dist-ssr/). Cloudflare serves /fr/quiz/rivers from
// fr/quiz/rivers.html; the app then takes over in the browser.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const { routes, render, head, sitemap, robots } = await import(join(root, "dist-ssr", "entry-server.js"));

let template = readFileSync(join(dist, "index.html"), "utf8");

// Put the (small) stylesheet inside each page: one less request blocking the
// first paint on slow mobile connections.
template = template.replace(/<link rel="stylesheet"[^>]*href="\/(assets\/[^"]+\.css)"[^>]*>/, (_, file) => {
  const css = readFileSync(join(dist, file), "utf8");
  if (!css.includes("url(/assets/")) throw new Error("prerender: expected absolute asset URLs in the CSS");
  return `<style>${css}</style>`;
});
if (!template.includes("<!--app-->") || !/<!--seo[\s\S]*?<!--\/seo-->/.test(template)) {
  throw new Error("prerender: index.html is missing its <!--seo--> or <!--app--> markers");
}

let count = 0;
for (const url of routes()) {
  const { lang, html: tags } = head(url);
  const page = template
    .replace(/<html lang="[^"]*"/, `<html lang="${lang}"`)
    .replace(/<!--seo[\s\S]*?<!--\/seo-->/, tags)
    .replace("<!--app-->", render(url));
  const file = url === "/" ? join(dist, "index.html") : join(dist, `${url.slice(1)}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, page);
  count++;
}
writeFileSync(join(dist, "sitemap.xml"), sitemap());
writeFileSync(join(dist, "robots.txt"), robots());
console.log(`prerender: wrote ${count} pages, sitemap.xml and robots.txt`);
