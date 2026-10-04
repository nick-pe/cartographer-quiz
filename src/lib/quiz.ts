import { COUNTRIES } from "../data/countries";
import type { Country } from "../data/types";
import { LEVELS, type Level, type QuizKind } from "./levels";
import { shuffle, type Rng } from "./random";

export interface Question {
  kind: QuizKind;
  level: Level;
  subject: Country;
  prompt: string;
  /** Flag code to show, for flag questions. */
  flag?: string;
  options: string[];
  answer: string;
}

function eligible(kind: QuizKind): Country[] {
  return kind === "flags" ? COUNTRIES : COUNTRIES.filter((c) => c.capitalQuestions);
}

function label(c: Country, kind: QuizKind): string {
  return kind === "capitals" ? c.capital : c.name;
}

/**
 * Picks wrong answers. Explorer draws from other well-known places; Navigator
 * prefers the same continent; Cartographer prefers the same subregion, so the
 * wrong answers sit right next to the right one.
 */
function distractors(subject: Country, kind: QuizKind, level: Level, count: number, rng: Rng): Country[] {
  const others = eligible(kind).filter((c) => c.code !== subject.code && label(c, kind) !== label(subject, kind));
  const tiers = LEVELS[level].tiers;
  const buckets: Country[][] =
    level === "explorer"
      ? [others.filter((c) => c.tier === 1), others]
      : level === "navigator"
        ? [others.filter((c) => c.region === subject.region && c.tier <= 2), others.filter((c) => c.region === subject.region), others]
        : [
            others.filter((c) => c.subregion === subject.subregion),
            others.filter((c) => c.region === subject.region && tiers.includes(c.tier)),
            others.filter((c) => c.region === subject.region),
            others,
          ];

  const chosen: Country[] = [];
  for (const bucket of buckets) {
    for (const c of shuffle(bucket, rng)) {
      if (chosen.length === count) return chosen;
      if (!chosen.includes(c)) chosen.push(c);
    }
  }
  return chosen;
}

export function makeQuestion(subject: Country, kind: QuizKind, level: Level, rng: Rng): Question {
  const wrong = distractors(subject, kind, level, LEVELS[level].options - 1, rng);
  const options = shuffle([subject, ...wrong], rng).map((c) => label(c, kind));
  const answer = label(subject, kind);
  switch (kind) {
    case "capitals":
      return { kind, level, subject, options, answer, prompt: `What is the capital of ${subject.name}?` };
    case "countries":
      return { kind, level, subject, options, answer, prompt: `${subject.capital} is the capital of…` };
    case "flags":
      return { kind, level, subject, options, answer, flag: subject.code, prompt: "Whose flag is this?" };
  }
}

/** Draws distinct subjects for a quiz, never repeating a country. */
export function drawSubjects(kind: QuizKind, level: Level, count: number, rng: Rng, exclude: Set<string> = new Set()): Country[] {
  const pool = eligible(kind).filter((c) => LEVELS[level].tiers.includes(c.tier) && !exclude.has(c.code));
  return shuffle(pool, rng).slice(0, count);
}

export function makeQuiz(kind: QuizKind, level: Level, count: number, rng: Rng): Question[] {
  return drawSubjects(kind, level, count, rng).map((s) => makeQuestion(s, kind, level, rng));
}
