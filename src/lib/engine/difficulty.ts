// Port of Models/Difficulty.swift.
//
// A tier changes four things at once: which slice of a fame-ordered dataset
// questions are drawn from, how many answer options are shown, how close the
// wrong answers are, and how long you get to answer.

export type Difficulty = "explorer" | "navigator" | "cartographer";

export const DIFFICULTIES: Difficulty[] = ["explorer", "navigator", "cartographer"];

export interface Tier {
  title: string;
  blurb: string;
  icon: string;
  /** CSS colour. */
  accent: string;
  optionCount: number;
  /** Seconds per question; null is untimed. */
  seconds: number | null;
  next: Difficulty | null;
}

export const TIERS: Record<Difficulty, Tier> = {
  explorer: {
    title: "Explorer",
    blurb: "Best-known places, no clock",
    icon: "🔭",
    accent: "rgb(51 191 128)",
    optionCount: 4,
    seconds: null,
    next: "navigator",
  },
  navigator: {
    title: "Navigator",
    blurb: "A wider net, 20s per question",
    icon: "🧭",
    accent: "rgb(77 140 242)",
    optionCount: 5,
    seconds: 20,
    next: "cartographer",
  },
  cartographer: {
    title: "Cartographer",
    blurb: "The deep cuts, 12s per question",
    icon: "🗺️",
    accent: "rgb(242 115 64)",
    optionCount: 6,
    seconds: 12,
    next: null,
  },
};

export function isDifficulty(value: unknown): value is Difficulty {
  return typeof value === "string" && value in TIERS;
}
