// Port of Models/Question.swift: the Question type and `make`, the single
// place answer options are assembled.
import { shuffle, type Rng } from "../random";
import { TIERS, type Difficulty } from "./difficulty";
import { pickDistractors } from "./distractors";

export type QuestionKind = "capital" | "regionCount" | "pickRegion" | "geoFeature" | "flag";

/**
 * What a name refers to, so each language can render it: countries via the
 * browser's built-in names, capitals and natural features via the place
 * dictionaries, regional (local) names as they are, numbers via Intl.
 */
export type TermKind = "country" | "capital" | "feature" | "local" | "number";

export interface Term {
  kind: TermKind;
  /** The English name from the app's data (the id answers are checked against). */
  id: string;
  /** For dual-capital countries: which capital is meant, e.g. "constitutional". */
  qualifier?: string;
}

/** The phrasings of category questions, from the app's `questionPrefix`. */
export const PREFIX_KEYS = {
  "What is the capital of": "capitalOf",
  "Which US state has this capital:": "usStateWithCapital",
  "In which region is this city located:": "regionOfCity",
  "What is the county town of": "countyTownOf",
  "What is the administrative center of": "adminCenterOf",
  "What is the main centre of": "mainCentreOf",
  "What is the regional centre of": "regionalCentreOf",
  "What is the seat of": "seatOf",
  "In which country is this city:": "countryOfCity",
} as const;

export type PrefixKey = (typeof PREFIX_KEYS)[keyof typeof PREFIX_KEYS];

/** Language-neutral description of a question's wording; each locale renders it. */
export type Prompt =
  | { key: PrefixKey; place: Term }
  | { key: "howMany" | "pickRegion"; category: string }
  | { key: "riverThrough" | "riverOutflow" | "riverCountry" | "mountainCountry" | "mountainRange"; place: Term }
  | { key: "seaBorder" | "seaOpensInto" | "islandCountry" | "islandWater" | "flagWhich"; place: Term }
  | { key: "longestRiver" | "highestMountain" | "largestSea" | "largestIsland" | "flagWhose" };

export interface Question {
  id: string;
  /** English wording, used for de-duplication and tests; screens render `prompt`. */
  text: string;
  prompt: Prompt;
  /** What the options name (all options in a question are the same kind). */
  optionKind: TermKind;
  options: string[];
  answer: string;
  kind: QuestionKind;
  /** The quiz this question came from, so a mixed round can attribute it. */
  quizId: string;
  /** Show this flag (ISO code) above the question. */
  flag?: string;
  /** Render options as flags: option label → ISO code. */
  optionFlags?: Record<string, string>;
}

/** A question before its options are assembled. Generators describe *what* to ask; `make` decides the options. */
export interface QuestionSpec {
  text: string;
  prompt: Prompt;
  optionKind: TermKind;
  correct: string;
  /** Candidate wrong answers, fame-ordered (an index is a fame rank). */
  distractorPool?: readonly string[];
  /** The correct answer's fame rank, for near-miss distractors. */
  correctRank?: number | null;
  /** Used verbatim instead of drawing from `distractorPool` (numeric and comparative questions). */
  fixedOptions?: string[];
  kind: QuestionKind;
  quizId: string;
  flag?: string;
  optionFlags?: Record<string, string>;
}

let nextId = 0;

export function make(spec: QuestionSpec, difficulty: Difficulty, rng?: Rng): Question | null {
  const base = {
    id: `q${nextId++}`,
    text: spec.text,
    prompt: spec.prompt,
    optionKind: spec.optionKind,
    answer: spec.correct,
    kind: spec.kind,
    quizId: spec.quizId,
    ...(spec.flag ? { flag: spec.flag } : {}),
    ...(spec.optionFlags ? { optionFlags: spec.optionFlags } : {}),
  };

  if (spec.fixedOptions) {
    const options = shuffle(spec.fixedOptions, rng);
    return options.includes(spec.correct) ? { ...base, options } : null;
  }

  const pool = orderedUnique(spec.distractorPool ?? []).filter((p) => p !== spec.correct);
  // A dataset with few distinct answers (UK Nations has 4) can't fill
  // Cartographer's 6 options, so clamp rather than emit a short question.
  const optionCount = Math.min(TIERS[difficulty].optionCount, pool.length + 1);
  const needed = optionCount - 1;
  if (needed < 1) return null;

  const distractors = pickDistractors(spec.correct, spec.correctRank ?? null, pool, needed, difficulty, rng);
  if (distractors.length !== needed) return null;
  return { ...base, options: shuffle([...distractors, spec.correct], rng) };
}

/** Deduplicates while preserving order, so fame ranking survives. */
export function orderedUnique<T>(items: readonly T[]): T[] {
  return [...new Set(items)];
}

export const isPresent = <T>(x: T | null | undefined): x is T => x != null;
