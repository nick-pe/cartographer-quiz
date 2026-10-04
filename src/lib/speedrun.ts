import type { QuizKind } from "./levels";
import { makeQuiz, type Question } from "./quiz";
import { seeded, shuffle } from "./random";

export const SPEED_LENGTH = 20;
/** Added to the clock for every wrong answer. */
export const SPEED_PENALTY_MS = 5_000;

/** Navigator's pool with four options: wide, but quick to scan. */
export function speedRun(kind: QuizKind, seed = Date.now()): Question[] {
  const rng = seeded(seed);
  return makeQuiz(kind, "navigator", SPEED_LENGTH, rng).map((q) => {
    const wrong = q.options.filter((o) => o !== q.answer).slice(0, 3);
    return { ...q, options: shuffle([q.answer, ...wrong], rng) };
  });
}
