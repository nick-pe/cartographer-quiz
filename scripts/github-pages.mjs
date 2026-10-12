// Builds the small GitHub Pages copy (dist-gh/) from the main build: the
// English Support and Privacy pages, which the App Store listing links to
// (nick-pe.github.io/cartographer-quiz/ and …/privacy.html). They're static:
// no app code, and every link and asset points at cartographerquiz.com.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const out = join(root, "dist-gh");
const SITE = "https://cartographerquiz.com";

const standalone = (file) =>
  readFileSync(join(dist, file), "utf8")
    // Resolve /privacy, /assets/… and the rest against the main site.
    .replace("<head>", `<head>\n    <base href="${SITE}/">`)
    // No app code: the page is complete as pre-rendered.
    .replace(/<script type="module"[^>]*><\/script>/g, "")
    .replace(/<link rel="modulepreload"[^>]*>/g, "");

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const support = standalone("support.html");
writeFileSync(join(out, "index.html"), support); // the App Store's Support URL
writeFileSync(join(out, "support.html"), support);
writeFileSync(join(out, "privacy.html"), standalone("privacy.html")); // the Privacy Policy URL
writeFileSync(
  join(out, "404.html"),
  `<!doctype html><meta charset="utf-8"><title>Cartographer</title><meta http-equiv="refresh" content="0; url=${SITE}/"><a href="${SITE}/">cartographerquiz.com</a>`,
);
console.log("github-pages: wrote dist-gh/ (index, support, privacy, 404)");
