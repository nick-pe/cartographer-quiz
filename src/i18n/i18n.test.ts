import { describe, expect, it } from "vitest";
import { COUNTRIES } from "../data/ios/countries";
import { ISLANDS, MOUNTAINS, RIVERS, SEAS } from "../data/ios/features";
import { DIFFICULTIES } from "../lib/engine/difficulty";
import { CATEGORY_LIST } from "../lib/engine/categories";
import type { Question } from "../lib/engine/question";
import { ALL_QUIZZES } from "../lib/engine/quizzes";
import { seeded } from "../lib/random";
import { REGION_COUNTRY_CODES, i18nFor } from ".";
import { en } from "./en";
import { LOCALES, localeFromPath, localizePath, preferredLocale, stripLocale } from "./locales";
import { PLACES } from "./places";
import { LEGAL } from "./legal";
import { sectionsFor } from "../lib/sections";

/** Every capital and natural-feature name in the data, except those that are also country names. */
const TRANSLATABLE = (() => {
  const countries = new Set(COUNTRIES.map((c) => c.name));
  const names = new Set<string>(COUNTRIES.map((c) => c.capital));
  const add = (x?: string | null) => x && !countries.has(x) && names.add(x);
  RIVERS.forEach((r) => [r.name, r.outflow, ...r.cities].forEach(add));
  MOUNTAINS.forEach((m) => [m.name, m.range].forEach(add));
  SEAS.forEach((s) => [s.name, s.connectedTo].forEach(add));
  ISLANDS.forEach((i) => [i.name, i.water].forEach(add));
  return names;
})();

/** A broad sample of generated questions: every tile, every tier, several seeds. */
const SAMPLE: Question[] = DIFFICULTIES.flatMap((d) => ALL_QUIZZES.flatMap((q) => [0, 1, 2, 3].flatMap((s) => q.make(d, seeded(s * 31 + 7)))));

describe("English rendering", () => {
  it("matches the engine's wording for every question", () => {
    const i18n = i18nFor("en");
    for (const q of SAMPLE) expect(i18n.prompt(q.prompt)).toBe(q.text);
  });

  it("renders options as the engine's ids", () => {
    const i18n = i18nFor("en");
    for (const q of SAMPLE) for (const o of q.options) expect(i18n.option(q, o)).toBe(o);
  });
});

describe.each(LOCALES.filter((l) => l.code !== "en").map((l) => l.code))("%s", (code) => {
  const i18n = i18nFor(code);

  it("renders every question without gaps", () => {
    for (const q of SAMPLE) {
      const text = i18n.prompt(q.prompt);
      expect(text, q.text).not.toMatch(/undefined|null|NaN|\$\{/);
      expect(text.length, q.text).toBeGreaterThan(3);
    }
  });

  it("never shows two options with the same label", () => {
    for (const q of SAMPLE) {
      const labels = q.options.map((o) => i18n.option(q, o));
      expect(new Set(labels).size, `${q.text} → ${labels.join(" / ")}`).toBe(labels.length);
    }
  });

  it("has a title and subtitle for every quiz", () => {
    for (const quiz of ALL_QUIZZES) {
      expect(i18n.quizTitle(quiz), quiz.id).toBeTruthy();
      expect(i18n.quizSubtitle(quiz), quiz.id).not.toMatch(/undefined|NaN/);
    }
  });

  it("knows every unit and noun the data uses", () => {
    const t = i18n.t;
    for (const c of CATEGORY_LIST) {
      expect(t.quizzes.nouns[c.countNoun], c.countNoun).toBeTruthy();
      if (c.regionInfo) expect(t.units[c.regionInfo.unitSingular], c.regionInfo.unitSingular).toBeTruthy();
    }
    for (const q of Object.keys(en.qualifiers)) expect(t.qualifiers[q]).toBeTruthy();
  });

  it("only lists place names that exist in the data", () => {
    for (const name of Object.keys(PLACES[code].names)) expect(TRANSLATABLE.has(name), `stray key "${name}"`).toBe(true);
  });
});

describe("Place coverage", () => {
  it.each(["zh", "ja", "ko"] as const)("%s translates every capital and natural feature", (code) => {
    const missing = [...TRANSLATABLE].filter((n) => !PLACES[code].names[n]);
    expect(missing).toEqual([]);
  });

  it("maps every region-quiz country to a code or a translation", () => {
    for (const c of CATEGORY_LIST) {
      if (!c.regionInfo) continue;
      const code = REGION_COUNTRY_CODES[c.regionInfo.country];
      expect(code !== undefined, c.regionInfo.country).toBe(true);
      if (code === null) for (const l of LOCALES) expect(i18nFor(l.code).t.extraCountries[c.regionInfo.country]).toBeTruthy();
    }
  });
});

describe("Locale paths", () => {
  it("reads and writes the language prefix", () => {
    expect(localeFromPath("/fr/daily")).toBe("fr");
    expect(localeFromPath("/daily")).toBe("en");
    expect(localeFromPath("/quiz/rivers")).toBe("en");
    expect(localeFromPath("/en/daily")).toBe("en");
    expect(stripLocale("/zh/quiz/rivers")).toBe("/quiz/rivers");
    expect(stripLocale("/ko")).toBe("/");
    expect(localizePath("/", "es")).toBe("/es");
    expect(localizePath("/daily", "it")).toBe("/it/daily");
    expect(localizePath("/daily", "en")).toBe("/daily");
  });

  it("picks the visitor's language from the browser", () => {
    expect(preferredLocale(["fr-CA", "en"])).toBe("fr");
    expect(preferredLocale(["ru-RU", "es-MX"])).toBe("es");
    expect(preferredLocale(["zh-TW"])).toBe("zh");
    expect(preferredLocale(["fil-PH"])).toBe("tl");
    expect(preferredLocale(["de-DE"])).toBe("de");
    expect(preferredLocale(["pt-BR"])).toBe("pt");
    expect(preferredLocale(["pt-PT"])).toBe("pt");
    expect(preferredLocale(["ru-RU"])).toBe("en");
  });
});

describe("Spot checks", () => {
  const q = (text: string) => SAMPLE.find((x) => x.text === text);

  it("reads naturally in each language", () => {
    const france = { key: "capitalOf" as const, place: { kind: "country" as const, id: "France" } };
    expect(i18nFor("fr").prompt(france)).toBe("France\u00a0: quelle est sa capitale\u202f?");
    expect(i18nFor("es").prompt(france)).toBe("¿Cuál es la capital de Francia?");
    expect(i18nFor("zh").prompt(france)).toBe("法国的首都是哪里？");
    expect(i18nFor("ko").prompt(france)).toBe("프랑스의 수도는 어디인가요?");
    expect(i18nFor("de").prompt(france)).toBe("Frankreich: Wie heißt die Hauptstadt?");
    expect(i18nFor("pt").prompt(france)).toBe("França: qual é a capital?");
    expect(i18nFor("de").prompt({ key: "howMany", category: "germanStates" })).toBe("Wie viele Bundesländer hat dieses Land: Deutschland?");
    expect(i18nFor("ko").prompt({ key: "howMany", category: "koreanProvinces" })).toBe("대한민국의 도는 모두 몇 개인가요?");
    const nile = { key: "riverOutflow" as const, place: { kind: "feature" as const, id: "Nile" } };
    expect(i18nFor("fr").prompt(nile)).toBe("Où se jette le Nil\u202f?");
    expect(i18nFor("es").prompt(nile)).toBe("¿Dónde desemboca el Nilo?");
    expect(i18nFor("it").prompt(nile)).toBe("Dove sfocia il Nilo?");
    expect(i18nFor("pt").prompt(nile)).toBe("Onde deságua o Nilo?");
    expect(i18nFor("pt").prompt({ key: "riverCountry", place: { kind: "feature", id: "Nile" } })).toBe("O Nilo atravessa qual destes países?");
    expect(i18nFor("ko").prompt(nile)).toBe("나일강은 어디로 흘러 들어가나요?");
    const qualified = { key: "capitalOf" as const, place: { kind: "country" as const, id: "Bolivia", qualifier: "constitutional" } };
    expect(i18nFor("es").prompt(qualified)).toBe("¿Cuál es la capital de Bolivia (capital constitucional)?");
    expect(q("Which of these is an autonomous community of Spain?") ?? true).toBeTruthy();
  });

  it("strips grammatical articles from answer buttons but keeps them in names", () => {
    const opt = (code: "fr" | "es" | "it", id: string) => i18nFor(code).option({ optionKind: "feature" } as Question, id);
    expect(opt("fr", "Nile")).toBe("Nil");
    expect(opt("fr", "Mediterranean Sea")).toBe("Mer Méditerranée");
    expect(opt("es", "Amazon")).toBe("Amazonas");
    expect(opt("it", "Alps")).toBe("Alpi");
    expect(i18nFor("fr").option({ optionKind: "capital" } as Question, "Cairo")).toBe("Le Caire");
    expect(i18nFor("es").option({ optionKind: "capital" } as Question, "Cairo")).toBe("El Cairo");
  });
});

describe("Support and Privacy pages", () => {
  it.each(LOCALES.map((l) => l.code))("%s has every question and section the English has", (code) => {
    const en = LEGAL.en;
    const page = LEGAL[code];
    expect(page.support.faq).toHaveLength(en.support.faq.length);
    expect(page.privacy.sections).toHaveLength(en.privacy.sections.length);
    page.privacy.sections.forEach((s, i) => expect(s.blocks.length, `section ${i}`).toBe(en.privacy.sections[i].blocks.length));
    if (code !== "en") expect(page.privacy.note).toContain("](en:/privacy)");
    const text = JSON.stringify(page);
    expect(text).toContain("cartographer.quiz@gmail.com");
    // Links are well-formed: [label](url) with no stray brackets.
    expect(text.match(/\]\(/g)?.length).toBe(text.match(/\]\((?:https?:|mailto:|en:\/|\/)[^)]*\)/g)?.length);
  });
});

describe("Section order", () => {
  const ids = (code: Parameters<typeof sectionsFor>[0]) => sectionsFor(code).map((s) => s.id);
  it("puts Asia right after World for Asian languages, Europe one place down", () => {
    for (const code of ["zh", "ja", "ko", "tl"] as const) {
      expect(ids(code).slice(0, 4)).toEqual(["mixed", "world", "asia", "europe"]);
      const world = sectionsFor(code).find((s) => s.id === "world")!.quizzes.map((q) => q.id);
      expect(world.indexOf("category.asianCapitals")).toBeLessThan(world.indexOf("category.europeanCapitals"));
    }
  });
  it("keeps the app's order elsewhere, with every tile still present", () => {
    for (const code of ["en", "de", "fr", "es", "it"] as const) expect(ids(code).slice(0, 4)).toEqual(["mixed", "world", "europe", "americas"]);
    const count = (code: Parameters<typeof sectionsFor>[0]) => sectionsFor(code).reduce((n, s) => n + s.quizzes.length, 0);
    expect(count("ja")).toBe(count("en"));
  });
});

describe("Regional names", () => {
  it.each(["zh", "ja", "ko"] as const)("%s names every division and capital of every regional quiz", (code) => {
    const i18n = i18nFor(code);
    const english: string[] = [];
    for (const c of CATEGORY_LIST) {
      if ("capitals" in c.source) continue;
      for (const p of c.pairs) {
        const terms = [p.place, c.optionKind === "country" ? null : { kind: c.optionKind, id: p.answer }];
        for (const term of terms) if (term && i18n.name(term as Parameters<typeof i18n.name>[0]) === term.id) english.push(`${c.id}: ${term.id}`);
      }
    }
    expect(english).toEqual([]);
  });

  it("keeps each language's own country in its own script", () => {
    expect(i18nFor("ja").name({ kind: "division", id: "Kanagawa" })).toBe("神奈川県");
    expect(i18nFor("zh").name({ kind: "division", id: "Kanagawa" })).toBe("神奈川县");
    expect(i18nFor("ko").name({ kind: "local", id: "Yokohama" })).toBe("요코하마");
    expect(i18nFor("ko").name({ kind: "division", id: "Shaanxi" })).not.toBe(i18nFor("ko").name({ kind: "division", id: "Shanxi" }));
    expect(i18nFor("de").name({ kind: "local", id: "Vienna" })).toBe("Wien");
  });
});
