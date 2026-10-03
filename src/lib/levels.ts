export type Level = "explorer" | "navigator" | "cartographer";
export type QuizKind = "capitals" | "countries" | "flags";

export interface LevelInfo {
  id: Level;
  name: string;
  blurb: string;
  options: number;
  /** Seconds per question, or null for untimed. */
  seconds: number | null;
  /** Which tiers questions are drawn from. */
  tiers: (1 | 2 | 3)[];
}

export const LEVELS: Record<Level, LevelInfo> = {
  explorer: {
    id: "explorer",
    name: "Explorer",
    blurb: "Well-known places. Four options, no clock.",
    options: 4,
    seconds: null,
    tiers: [1],
  },
  navigator: {
    id: "navigator",
    name: "Navigator",
    blurb: "A wider net. Five options, 20 seconds.",
    options: 5,
    seconds: 20,
    tiers: [1, 2],
  },
  cartographer: {
    id: "cartographer",
    name: "Cartographer",
    blurb: "The obscure ones. Six options, 12 seconds, and close calls.",
    options: 6,
    seconds: 12,
    tiers: [2, 3],
  },
};

export const LEVEL_ORDER: Level[] = ["explorer", "navigator", "cartographer"];

export interface KindInfo {
  id: QuizKind;
  name: string;
  blurb: string;
}

export const KINDS: Record<QuizKind, KindInfo> = {
  capitals: { id: "capitals", name: "Capitals", blurb: "Name the capital city." },
  countries: { id: "countries", name: "Countries", blurb: "Which country is this the capital of?" },
  flags: { id: "flags", name: "Flags", blurb: "Whose flag is this?" },
};

export const KIND_ORDER: QuizKind[] = ["capitals", "countries", "flags"];
