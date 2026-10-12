import { describe, expect, it } from "vitest";
import { LOCALES } from "./i18n/locales";
import { ALL_QUIZZES } from "./lib/engine/quizzes";
import { LEARNABLE } from "./lib/learn";
import { pages, robots, sitemap } from "./seo";

describe("sitemap", () => {
  const xml = sitemap("2026-10-12");
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  it("lists every page in every language, once", () => {
    expect(pages()).toHaveLength(ALL_QUIZZES.length + LEARNABLE.length + 3);
    expect(locs).toHaveLength(pages().length * LOCALES.length);
    expect(new Set(locs).size).toBe(locs.length);
    expect(locs).toContain("https://cartographerquiz.com/");
    expect(locs).toContain("https://cartographerquiz.com/fr");
    expect(locs).toContain("https://cartographerquiz.com/de/daily");
    expect(locs).toContain("https://cartographerquiz.com/zh/quiz/world-capitals");
    expect(locs).toContain("https://cartographerquiz.com/es/learn/rivers");
  });

  it("links each language version to all the others", () => {
    const first = xml.slice(0, xml.indexOf("</url>"));
    expect(first.match(/hreflang=/g)).toHaveLength(LOCALES.length + 1);
    expect(first).toContain('hreflang="x-default" href="https://cartographerquiz.com/"');
  });

  it("is well-formed enough for search engines", () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml.split("<url>").length - 1).toBe(xml.split("</url>").length - 1);
    expect(xml).not.toMatch(/&(?!amp;|lt;|gt;)/);
  });

  it("points robots at the sitemap", () => {
    expect(robots()).toContain("Sitemap: https://cartographerquiz.com/sitemap.xml");
  });
});
