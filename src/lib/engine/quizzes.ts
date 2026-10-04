// Port of Models/Quiz.swift: every tile on the home screen, grouped into
// sections, with its look and how it makes questions.
import { SECTIONS } from "../../data/ios/categories";
import { ISLANDS, MOUNTAINS, RIVERS, SEAS } from "../../data/ios/features";
import type { BackdropId, SectionId } from "../../data/types";
import { randomInt, type Rng } from "../random";
import { CATEGORY_LIST } from "./categories";
import type { Difficulty } from "./difficulty";
import {
  categoryQuestions,
  countQuestions,
  findFlagQuestions,
  flagQuestions,
  islandQuestions,
  mountainQuestions,
  pickRegionQuestions,
  randomMix,
  riverQuestions,
  seaQuestions,
} from "./generators";
import type { Question } from "./question";

export const SPEED_RUN_LENGTH = 10;

export interface QuizDef {
  /** Stable id stored in history (matches the app's Quiz.id where one exists). */
  id: string;
  /** URL segment: /quiz/:slug. */
  slug: string;
  title: string;
  emoji: string;
  subtitle: string;
  /** Two RGB stops, 0–1. */
  gradient: [number, number, number][];
  backdrop: BackdropId;
  isSpeedRun?: boolean;
  make: (difficulty: Difficulty, rng?: Rng) => Question[];
}

const kebab = (s: string) => s.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

function special(
  id: string,
  title: string,
  emoji: string,
  subtitle: string,
  gradient: [number, number, number][],
  backdrop: BackdropId,
  make: QuizDef["make"],
  extra: Partial<QuizDef> = {},
): QuizDef {
  return { id, slug: kebab(id), title, emoji, subtitle, gradient, backdrop, make, ...extra };
}

// Titles, emoji and gradients for the non-dataset quizzes are from Quiz.swift.
export const RANDOM_MIX = special("randomMix", "Random Mix", "🎲", "All quiz types", [[0.5, 0.3, 0.85], [0.85, 0.3, 0.6]], "temperate",
  // A random mix varies in length each time you play it.
  (d, rng) => randomMix(d, randomInt(8, 15, rng), rng));
export const SPEED_RUN = special("speedRun", "Speed Run", "⚡", "Beat your best time", [[0.98, 0.78, 0.15], [0.9, 0.45, 0.1]], "temperate",
  (d, rng) => randomMix(d, SPEED_RUN_LENGTH, rng), { isSpeedRun: true });
const HOW_MANY = special("howManyRegions", "How Many Regions?", "🔢", "Count the regions", [[0.1, 0.6, 0.6], [0.1, 0.45, 0.55]], "temperate",
  (d, rng) => countQuestions(d, 10, rng));
const SPOT = special("spotTheRegion", "Spot the Region", "📍", "Pick the real region", [[0.95, 0.55, 0.2], [0.85, 0.35, 0.15]], "temperate",
  (d, rng) => pickRegionQuestions(d, 10, rng));

// Web-only: the flag quizzes, which sit in the World section.
const FLAGS = special("flags", "Flags of the World", "🏁", "193 flags", [[0.2, 0.25, 0.55], [0.75, 0.2, 0.3]], "city",
  (d, rng) => flagQuestions(d, 10, rng));
const FIND_FLAG = special("findTheFlag", "Find the Flag", "🎌", "Spot the right one", [[0.95, 0.75, 0.25], [0.2, 0.55, 0.45]], "city",
  (d, rng) => findFlagQuestions(d, 10, rng));

const NATURAL: QuizDef[] = [
  special("rivers", "Rivers", "🏞️", `${RIVERS.length} great rivers`, [[0.15, 0.6, 0.55], [0.1, 0.4, 0.5]], "river", (d, rng) => riverQuestions(d, 10, rng)),
  special("mountains", "Mountains", "🏔️", `${MOUNTAINS.length} peaks`, [[0.45, 0.5, 0.65], [0.2, 0.28, 0.45]], "alpine", (d, rng) => mountainQuestions(d, 10, rng)),
  special("seas", "Seas & Oceans", "🌊", `${SEAS.length} seas & gulfs`, [[0.1, 0.45, 0.8], [0.05, 0.25, 0.5]], "ocean", (d, rng) => seaQuestions(d, 10, rng)),
  special("islands", "Islands", "🏝️", `${ISLANDS.length} islands`, [[0.15, 0.68, 0.62], [0.95, 0.78, 0.35]], "tropical", (d, rng) => islandQuestions(d, 10, rng)),
];

export const DAILY_QUIZ = { id: "dailyChallenge", title: "Daily Challenge", gradient: [[0.95, 0.45, 0.2], [0.85, 0.25, 0.35]] as [number, number, number][] };

const categoryQuiz = (c: (typeof CATEGORY_LIST)[number]): QuizDef => ({
  id: `category.${c.id}`,
  slug: kebab(c.id),
  title: c.title,
  emoji: c.emoji,
  subtitle: c.subtitle,
  gradient: c.gradient,
  backdrop: c.backdrop,
  make: (d, rng) => categoryQuestions(c, d, 10, rng),
});

export interface QuizSection {
  id: SectionId | "mixed";
  title: string;
  quizzes: QuizDef[];
}

export const HOME_SECTIONS: QuizSection[] = [
  { id: "mixed", title: "Mixed & Random", quizzes: [RANDOM_MIX, SPEED_RUN, HOW_MANY, SPOT] },
  ...SECTIONS.map((s) => ({
    id: s.id,
    title: s.title,
    quizzes:
      s.id === "naturalWorld"
        ? NATURAL
        : [...CATEGORY_LIST.filter((c) => c.section === s.id).map(categoryQuiz), ...(s.id === "world" ? [FLAGS, FIND_FLAG] : [])],
  })).filter((s) => s.quizzes.length),
];

export const ALL_QUIZZES: QuizDef[] = HOME_SECTIONS.flatMap((s) => s.quizzes);
export const QUIZ_BY_SLUG: Record<string, QuizDef> = Object.fromEntries(ALL_QUIZZES.map((q) => [q.slug, q]));

export const gradientCss = (g: [number, number, number][]) =>
  `linear-gradient(135deg, ${g.map(([r, gr, b]) => `rgb(${Math.round(r * 255)} ${Math.round(gr * 255)} ${Math.round(b * 255)})`).join(", ")})`;
