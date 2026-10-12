// Emits sitemap.xml and robots.txt at build time, from the same quiz and
// language lists the site uses, so they never drift out of date.
import type { Plugin } from "vite";
import { LOCALES, localizePath } from "../src/i18n/locales";
import { ALL_QUIZZES } from "../src/lib/engine/quizzes";

/** The canonical site. The GitHub Pages copy points here too. */
export const SITE = "https://cartographerquiz.com";

/** Pages worth finding in search: the home page, the Daily and every quiz, in every language. */
export function pages(): string[] {
  return ["/", "/daily", ...ALL_QUIZZES.map((q) => `/quiz/${q.slug}`)];
}

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function sitemap(today = new Date().toISOString().slice(0, 10)): string {
  const entries = pages().flatMap((page) => {
    // Every language version lists all the others (hreflang), plus x-default.
    const alternates = [
      ...LOCALES.map((l) => `    <xhtml:link rel="alternate" hreflang="${l.code}" href="${escape(SITE + localizePath(page, l.code))}"/>`),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${escape(SITE + page)}"/>`,
    ].join("\n");
    return LOCALES.map(
      (l) =>
        `  <url>\n    <loc>${escape(SITE + localizePath(page, l.code))}</loc>\n    <lastmod>${today}</lastmod>\n` +
        `    <changefreq>${page === "/daily" ? "daily" : "weekly"}</changefreq>\n${alternates}\n  </url>`,
    );
  });
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    `${entries.join("\n")}\n</urlset>\n`
  );
}

export const robots = () => `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`;

export function seo(): Plugin {
  return {
    name: "cartographer-seo",
    apply: "build",
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemap() });
      this.emitFile({ type: "asset", fileName: "robots.txt", source: robots() });
    },
  };
}
