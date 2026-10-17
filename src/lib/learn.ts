// Study lists: the full data behind each quiz, as language-neutral tables
// that each locale renders (and sorts) in its own words. No React here, so
// the build can list the pages for the sitemap.
import { COUNTRIES } from "../data/ios/countries";
import { ISLANDS, MOUNTAINS, RIVERS, SEAS } from "../data/ios/features";
import type { Messages } from "../i18n/en";
import { CATEGORY_BY_ID, CATEGORY_LIST } from "./engine/categories";
import type { Term } from "./engine/question";
import { ALL_QUIZZES, QUIZ_BY_SLUG, type QuizDef } from "./engine/quizzes";

export type Column = keyof Messages["learn"]["columns"];

export type Cell =
  | { term: Term; flag?: string }
  | { num: number; unit?: string }
  | { terms: Term[] }
  /** A RegionInfo country ("the United States"), rendered like the How Many question does. */
  | { regionCountry: string }
  /** The plural name of a category's divisions ("states", "Bundesländer"). */
  | { unitsOf: string };

export interface LearnTable {
  columns: Column[];
  rows: Cell[][];
  /** Ranked lists (longest river first) keep their order; the rest sort by the first column. */
  ranked?: boolean;
  /** Flags quizzes show a gallery rather than a table. */
  gallery?: boolean;
}

const CODE_BY_COUNTRY = Object.fromEntries(COUNTRIES.map((c) => [c.name, c.code]));
const country = (id: string): Cell => ({ term: { kind: "country", id }, flag: CODE_BY_COUNTRY[id] });
const feature = (id: string): Cell => ({ term: { kind: "feature", id } });
const countries = (ids: string[]): Cell => ({ terms: ids.map((id) => ({ kind: "country" as const, id })) });

function categoryTable(id: string): LearnTable | null {
  const c = CATEGORY_BY_ID[id];
  // "Name the State" is US State Capitals the other way round: one list serves both.
  if (c.promptKey === "usStateWithCapital") return null;
  if ("capitals" in c.source) {
    return { columns: ["country", "capital"], rows: c.pairs.map((p) => [{ term: p.place, flag: CODE_BY_COUNTRY[p.place.id] }, { term: { kind: "capital", id: p.answer } }]) };
  }
  const city = c.promptKey === "regionOfCity" || c.promptKey === "countryOfCity";
  const second: Column = c.promptKey === "countryOfCity" ? "country" : c.promptKey === "regionOfCity" ? "region" : "capital";
  return {
    columns: [city ? "city" : "region", second],
    rows: c.pairs.map((p) => [{ term: p.place }, second === "country" ? country(p.answer) : { term: { kind: c.optionKind, id: p.answer } }]),
  };
}

const TABLES: Record<string, () => LearnTable> = {
  flags: () => ({ columns: ["country"], rows: COUNTRIES.map((c) => [country(c.name)]), gallery: true }),
  rivers: () => ({
    columns: ["river", "length", "countries", "flowsInto"],
    rows: [...RIVERS].sort((a, b) => b.lengthKm - a.lengthKm).map((r) => [feature(r.name), { num: r.lengthKm, unit: "km" }, countries(r.countries), feature(r.outflow)]),
    ranked: true,
  }),
  mountains: () => ({
    columns: ["mountain", "height", "range", "countries"],
    rows: [...MOUNTAINS].sort((a, b) => b.heightM - a.heightM).map((m) => [feature(m.name), { num: m.heightM, unit: "m" }, m.range ? feature(m.range) : { terms: [] }, countries(m.countries)]),
    ranked: true,
  }),
  seas: () => ({
    columns: ["sea", "area", "opensInto", "borders"],
    rows: [...SEAS].sort((a, b) => b.areaKm2 - a.areaKm2).map((s) => [feature(s.name), { num: s.areaKm2, unit: "km²" }, s.connectedTo ? feature(s.connectedTo) : { terms: [] }, countries(s.borderingCountries)]),
    ranked: true,
  }),
  islands: () => ({
    columns: ["island", "area", "country", "water"],
    rows: [...ISLANDS].sort((a, b) => b.areaKm2 - a.areaKm2).map((i) => [feature(i.name), { num: i.areaKm2, unit: "km²" }, countries(i.countries), feature(i.water)]),
    ranked: true,
  }),
  howManyRegions: () => ({
    columns: ["country", "divisions", "count"],
    rows: CATEGORY_LIST.filter((c) => c.regionInfo?.canonicalCount != null).map((c) => [
      { regionCountry: c.regionInfo!.country },
      { unitsOf: c.id },
      { num: c.regionInfo!.canonicalCount! },
    ]),
  }),
};

export function learnTable(quiz: Pick<QuizDef, "id">): LearnTable | null {
  if (quiz.id.startsWith("category.")) return categoryTable(quiz.id.slice("category.".length));
  return TABLES[quiz.id]?.() ?? null;
}

/** Quizzes with their own study page, in home-screen order. */
export const LEARNABLE: QuizDef[] = ALL_QUIZZES.filter((q) => learnTable(q));

/** The study page for a quiz, including quizzes that share another's list. */
export function studySlugFor(quiz: QuizDef): string | null {
  if (quiz.id === "findTheFlag") return "flags";
  if (quiz.id === "category.nameTheState") return QUIZ_BY_SLUG["us-state-capitals"] ? "us-state-capitals" : null;
  return LEARNABLE.includes(quiz) ? quiz.slug : null;
}

// ---------------------------------------------------------------------------
// Facts: a few numbers drawn from each list's data, which every language turns
// into a short introduction (so each study page says something of its own).
// Only facts the data states fully: lengths, heights, areas and counts of the
// list itself. (Lists of countries per river or sea are partial in the data.)

export type Fact =
  | { kind: "capitals"; count: number; multiCapital: Term[] }
  | { kind: "divisions"; category: string; count: number; sameName: number }
  | { kind: "towns"; count: number; groups: number; groupsAreCountries: boolean }
  | { kind: "rivers"; count: number; longest: Term; longestKm: number; shortest: Term; shortestKm: number }
  | { kind: "mountains"; count: number; highest: Term; highestM: number; over8000: number; ranges: number }
  | { kind: "seas"; count: number; largest: Term; largestKm2: number }
  | { kind: "islands"; count: number; largest: Term; largestKm2: number; shared: number }
  | { kind: "flags"; count: number; byRegion: { region: "europe" | "asia" | "africa" | "americas" | "oceania"; count: number }[] }
  | { kind: "howMany"; most: string; fewest: string };

const maxBy = <T>(xs: readonly T[], f: (x: T) => number) => xs.reduce((a, b) => (f(b) > f(a) ? b : a));
const minBy = <T>(xs: readonly T[], f: (x: T) => number) => xs.reduce((a, b) => (f(b) < f(a) ? b : a));
const featureTerm = (id: string): Term => ({ kind: "feature", id });

export function learnFacts(quiz: Pick<QuizDef, "id">): Fact | null {
  if (quiz.id.startsWith("category.")) {
    const c = CATEGORY_BY_ID[quiz.id.slice("category.".length)];
    if ("capitals" in c.source) {
      return { kind: "capitals", count: c.pairs.length, multiCapital: c.pairs.filter((p) => p.place.qualifier).map((p) => ({ kind: "country", id: p.place.id })) };
    }
    if (c.promptKey === "regionOfCity" || c.promptKey === "countryOfCity") {
      return { kind: "towns", count: c.pairs.length, groups: new Set(c.pairs.map((p) => p.answer)).size, groupsAreCountries: c.promptKey === "countryOfCity" };
    }
    if (c.promptKey === "usStateWithCapital") return null;
    return { kind: "divisions", category: c.id, count: c.pairs.length, sameName: c.pairs.filter((p) => p.prompt === p.answer).length };
  }
  switch (quiz.id) {
    case "rivers": {
      const longest = maxBy(RIVERS, (r) => r.lengthKm);
      const shortest = minBy(RIVERS, (r) => r.lengthKm);
      return { kind: "rivers", count: RIVERS.length, longest: featureTerm(longest.name), longestKm: longest.lengthKm, shortest: featureTerm(shortest.name), shortestKm: shortest.lengthKm };
    }
    case "mountains": {
      const highest = maxBy(MOUNTAINS, (m) => m.heightM);
      return { kind: "mountains", count: MOUNTAINS.length, highest: featureTerm(highest.name), highestM: highest.heightM, over8000: MOUNTAINS.filter((m) => m.heightM >= 8000).length, ranges: new Set(MOUNTAINS.map((m) => m.range).filter(Boolean)).size };
    }
    case "seas": {
      const largest = maxBy(SEAS, (s) => s.areaKm2);
      return { kind: "seas", count: SEAS.length, largest: featureTerm(largest.name), largestKm2: largest.areaKm2 };
    }
    case "islands": {
      const largest = maxBy(ISLANDS, (i) => i.areaKm2);
      return { kind: "islands", count: ISLANDS.length, largest: featureTerm(largest.name), largestKm2: largest.areaKm2, shared: ISLANDS.filter((i) => i.countries.length > 1).length };
    }
    case "flags": {
      const regions = ["africa", "asia", "europe", "americas", "oceania"] as const;
      return { kind: "flags", count: COUNTRIES.length, byRegion: regions.map((region) => ({ region, count: COUNTRIES.filter((c) => c.region === region).length })) };
    }
    case "howManyRegions": {
      const counted = CATEGORY_LIST.filter((c) => c.regionInfo?.canonicalCount != null);
      return { kind: "howMany", most: maxBy(counted, (c) => c.regionInfo!.canonicalCount!).id, fewest: minBy(counted, (c) => c.regionInfo!.canonicalCount!).id };
    }
  }
  return null;
}

/** Up to `n` entries of a quiz's list, as a taste of what it asks (for quiz pages). */
export function sampleRows(quiz: QuizDef, n = 8): Cell[][] {
  const slug = studySlugFor(quiz);
  const table = slug ? learnTable(QUIZ_BY_SLUG[slug]) : null;
  if (!table) return [];
  // Ranked lists show their top entries; the rest, the best-known first (data order is fame order).
  return table.rows.slice(0, n).map((r) => r.slice(0, table.gallery ? 1 : 2));
}
