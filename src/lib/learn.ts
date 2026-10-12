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
    rows: c.pairs.map((p) => [{ term: p.place }, second === "country" ? country(p.answer) : { term: { kind: "local", id: p.answer } }]),
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
