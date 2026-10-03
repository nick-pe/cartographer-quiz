// Copies the flag SVGs for every country in the quiz into public/flags.
// Flags from flag-icons (MIT, https://github.com/lipis/flag-icons).
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";

const src = readFileSync(new URL("../src/data/countries.ts", import.meta.url), "utf8");
const codes = [...src.matchAll(/"code": "([A-Z]{2})"/g)].map((m) => m[1].toLowerCase());
const out = new URL("../public/flags/", import.meta.url);
mkdirSync(out, { recursive: true });
for (const code of codes) {
  copyFileSync(new URL(`../node_modules/flag-icons/flags/4x3/${code}.svg`, import.meta.url), new URL(`${code}.svg`, out));
}
console.log(`copied ${codes.length} flags`);
