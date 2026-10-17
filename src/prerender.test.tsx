import { describe, expect, it } from "vitest";
import { head, render, routes } from "./entry-server";
import { i18nFor } from "./i18n/core";
import { LOCALES } from "./i18n/locales";
import { ALL_QUIZZES, QUIZ_BY_SLUG } from "./lib/engine/quizzes";
import { LEARNABLE, learnTable, sampleRows, studySlugFor } from "./lib/learn";
import { factText } from "./lib/facts";

describe("study lists", () => {
  it("exist for every quiz except the mixed ones", () => {
    const without = ALL_QUIZZES.filter((q) => !studySlugFor(q)).map((q) => q.id);
    expect(without.sort()).toEqual(["randomMix", "speedRun", "spotTheRegion"]);
    expect(studySlugFor(QUIZ_BY_SLUG["find-the-flag"])).toBe("flags");
    expect(studySlugFor(QUIZ_BY_SLUG["name-the-state"])).toBe("us-state-capitals");
  });

  it("have a full, well-formed table", () => {
    for (const quiz of LEARNABLE) {
      const table = learnTable(quiz)!;
      expect(table.rows.length, quiz.id).toBeGreaterThan(3);
      for (const row of table.rows) expect(row, quiz.id).toHaveLength(table.columns.length);
    }
    expect(learnTable(QUIZ_BY_SLUG["world-capitals"])!.rows).toHaveLength(193);
    expect(learnTable(QUIZ_BY_SLUG["flags"])!.gallery).toBe(true);
  });

  it("rank rivers from the longest", () => {
    const first = learnTable(QUIZ_BY_SLUG.rivers)!.rows[0][0];
    expect(first).toMatchObject({ term: { id: "Nile" } });
  });
});

describe("pre-rendered pages", () => {
  it("cover every page in every language", () => {
    const all = routes();
    expect(all).toHaveLength((7 + ALL_QUIZZES.length + LEARNABLE.length) * LOCALES.length);
    expect(all).toContain("/");
    expect(all).toContain("/ko/learn/world-capitals");
    expect(new Set(all).size).toBe(all.length);
  });

  it("give each page its own title, description, language and alternates", () => {
    const fr = head("/fr/quiz/rivers");
    expect(fr.lang).toBe("fr");
    expect(fr.html).toContain("<title>Fleuves · Cartographer</title>");
    expect(fr.html).toContain('<link rel="canonical" href="https://cartographerquiz.com/fr/quiz/rivers" />');
    expect(fr.html).toContain('hreflang="de" href="https://cartographerquiz.com/de/quiz/rivers"');
    expect(fr.html).toContain('content="https://cartographerquiz.com/og/fr.png"');
    expect(fr.html).not.toContain("noindex");
    expect(head("/").html).toContain('hreflang="x-default" href="https://cartographerquiz.com/"');
    expect(head("/de/settings").html).toContain('<meta name="robots" content="noindex" />');
  });

  it("escape text that goes into attributes", () => {
    for (const url of routes()) expect(head(url).html, url).not.toMatch(/content="[^"]*<|="undefined"|NaN/);
  });

  it("render the real content into the page", () => {
    const html = render("/es/learn/world-capitals");
    const t = i18nFor("es").t;
    expect(html).toContain(t.learn.title(i18nFor("es").quizTitle(QUIZ_BY_SLUG["world-capitals"])));
    expect(html).toContain("Pekín");
    expect(html).toContain("Afganistán");
    expect(render("/zh")).toContain(i18nFor("zh").t.home.tagline);
  });

  it("give every study list a facts introduction in every language", () => {
    const withoutFacts = LEARNABLE.filter((q) => !factText(i18nFor("en"), q)).map((q) => q.id);
    expect(withoutFacts).toEqual([]);
    for (const { code } of LOCALES) {
      for (const quiz of LEARNABLE) {
        const text = factText(i18nFor(code), quiz)!;
        expect(text, `${code} ${quiz.id}`).not.toMatch(/undefined|null|NaN|\$\{|\[object/);
      }
    }
    expect(factText(i18nFor("en"), QUIZ_BY_SLUG.rivers)).toContain("Nile (6,650 km)");
    expect(render("/ja/learn/japanese-prefectures")).toContain(factText(i18nFor("ja"), QUIZ_BY_SLUG["japanese-prefectures"])!);
  });

  it("describe each quiz below the game, with a sample, the levels and similar quizzes", () => {
    for (const quiz of ALL_QUIZZES) if (studySlugFor(quiz)) expect(sampleRows(quiz).length, quiz.id).toBeGreaterThan(3);
    const fr = i18nFor("fr");
    const html = render("/fr/quiz/rivers");
    expect(html).toContain(fr.t.quizPage.about);
    expect(html).toContain(fr.t.tiers.cartographer.blurb);
    expect(html).toContain('href="/fr/learn/rivers"');
    expect(html).toContain('href="/fr/quiz/mountains"');
    expect(render("/quiz/random-mix")).toContain('href="/learn/world-capitals"');
  });
});
