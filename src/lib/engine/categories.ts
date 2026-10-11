// The (prompt, answer) datasets, assembled from the app's descriptors.
// Port of QuizCategory / QuizCategoryDescriptor / CountriesData helpers.
import { CATEGORIES } from "../../data/ios/categories";
import { COUNTRIES } from "../../data/ios/countries";
import { PAIRS } from "../../data/ios/pairs";
import type { CategoryDef } from "../../data/types";
import { PREFIX_KEYS, type PrefixKey, type Term, type TermKind } from "./question";

export interface Pair {
  prompt: string;
  answer: string;
  /** The prompt as a term, so other languages can render it. */
  place: Term;
}

export interface Category extends CategoryDef {
  pairs: Pair[];
  /** The place's own region names, for "Which of these is a … of …?". */
  regionNames: string[];
  /** Rows, or distinct regions for datasets keyed on the answer. */
  count: number;
  subtitle: string;
  promptKey: PrefixKey;
  optionKind: TermKind;
}

function pairsFor(def: CategoryDef): Pair[] {
  if ("capitals" in def.source) {
    const region = def.source.capitals;
    // Preserves fame order within the filtered subset.
    return COUNTRIES.filter((c) => region === null || c.region === region).map((c) => ({
      prompt: c.capitalQualifier ? `${c.name} (${c.capitalQualifier})` : c.name,
      answer: c.capital,
      place: { kind: "country", id: c.name, ...(c.capitalQualifier ? { qualifier: c.capitalQualifier } : {}) },
    }));
  }
  const rows = PAIRS[def.source.dataset];
  if (!rows) throw new Error(`Unknown dataset ${def.source.dataset}`);
  const local = (prompt: string, answer: string): Pair => ({ prompt, answer, place: { kind: "local", id: prompt } });
  return def.source.reversed ? rows.map(([p, a]) => local(a, p)) : rows.map(([p, a]) => local(p, a));
}

export const CATEGORY_LIST: Category[] = CATEGORIES.map((def) => {
  const pairs = pairsFor(def);
  const regionNames = def.regionNameSource === "answer" ? [...new Set(pairs.map((p) => p.answer))] : pairs.map((p) => p.prompt);
  // France stores cities as prompts, so its subtitle counts distinct regions.
  const count = def.regionNameSource === "answer" ? new Set(pairs.map((p) => p.answer)).size : pairs.length;
  const promptKey = PREFIX_KEYS[def.questionPrefix as keyof typeof PREFIX_KEYS];
  if (!promptKey) throw new Error(`No prompt key for "${def.questionPrefix}"`);
  // Capitals quizzes answer with capitals, the Maghreb quiz with countries, the rest with local names.
  const optionKind: TermKind = "capitals" in def.source ? "capital" : promptKey === "countryOfCity" ? "country" : "local";
  return { ...def, pairs, regionNames, count, subtitle: `${count} ${def.countNoun}`, promptKey, optionKind };
});

export const CATEGORY_BY_ID: Record<string, Category> = Object.fromEntries(CATEGORY_LIST.map((c) => [c.id, c]));
