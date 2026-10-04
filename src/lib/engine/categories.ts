// The (prompt, answer) datasets, assembled from the app's descriptors.
// Port of QuizCategory / QuizCategoryDescriptor / CountriesData helpers.
import { CATEGORIES } from "../../data/ios/categories";
import { COUNTRIES } from "../../data/ios/countries";
import { PAIRS } from "../../data/ios/pairs";
import type { CategoryDef } from "../../data/types";

export interface Pair {
  prompt: string;
  answer: string;
}

export interface Category extends CategoryDef {
  pairs: Pair[];
  /** The place's own region names, for "Which of these is a … of …?". */
  regionNames: string[];
  subtitle: string;
}

function pairsFor(def: CategoryDef): Pair[] {
  if ("capitals" in def.source) {
    const region = def.source.capitals;
    // Preserves fame order within the filtered subset.
    return COUNTRIES.filter((c) => region === null || c.region === region).map((c) => ({
      prompt: c.capitalQualifier ? `${c.name} (${c.capitalQualifier})` : c.name,
      answer: c.capital,
    }));
  }
  const rows = PAIRS[def.source.dataset];
  if (!rows) throw new Error(`Unknown dataset ${def.source.dataset}`);
  return def.source.reversed ? rows.map(([p, a]) => ({ prompt: a, answer: p })) : rows.map(([p, a]) => ({ prompt: p, answer: a }));
}

export const CATEGORY_LIST: Category[] = CATEGORIES.map((def) => {
  const pairs = pairsFor(def);
  const regionNames = def.regionNameSource === "answer" ? [...new Set(pairs.map((p) => p.answer))] : pairs.map((p) => p.prompt);
  // France stores cities as prompts, so its subtitle counts distinct regions.
  const count = def.regionNameSource === "answer" ? new Set(pairs.map((p) => p.answer)).size : pairs.length;
  return { ...def, pairs, regionNames, subtitle: `${count} ${def.countNoun}` };
});

export const CATEGORY_BY_ID: Record<string, Category> = Object.fromEntries(CATEGORY_LIST.map((c) => [c.id, c]));
