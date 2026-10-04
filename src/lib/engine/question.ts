// Port of Models/Question.swift: the Question type and `make`, the single
// place answer options are assembled.
import { shuffle, type Rng } from "../random";
import { TIERS, type Difficulty } from "./difficulty";
import { pickDistractors } from "./distractors";

export type QuestionKind = "capital" | "regionCount" | "pickRegion" | "geoFeature" | "flag";

export interface Question {
  id: string;
  text: string;
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
