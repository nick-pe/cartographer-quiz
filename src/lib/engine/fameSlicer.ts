// Port of Models/FameSlicer.swift.
//
// Data files are ordered best-known first, so an index *is* a fame rank.
// Windows are nested and tail-biased rather than disjoint: Cartographer should
// still occasionally see a well-known entry.
import { shuffle, type Rng } from "../random";
import type { Difficulty } from "./difficulty";

/** Below this many rows there is no meaningful "obscure tail", so every tier draws from all of it. */
export const MINIMUM_ROWS_FOR_SLICING = 12;

/** Half-open [lower, upper). */
export function fameWindow(n: number, difficulty: Difficulty): [number, number] {
  if (n < MINIMUM_ROWS_FOR_SLICING) return [0, n];
  switch (difficulty) {
    case "explorer":
      return [0, Math.max(1, Math.ceil(n * 0.4))];
    case "navigator": {
      const lower = Math.floor(n * 0.15);
      return [lower, Math.min(n, Math.max(lower + 1, Math.ceil(n * 0.75)))];
    }
    case "cartographer":
      return [Math.min(Math.floor(n * 0.45), Math.max(0, n - 1)), n];
  }
}

const range = (lo: number, hi: number) => Array.from({ length: Math.max(0, hi - lo) }, (_, i) => lo + i);

/** Samples up to `count` rows from the tier's window, backfilling from outside it rather than returning short. */
export function fameSample<T>(rows: readonly T[], difficulty: Difficulty, count: number, rng?: Rng): { index: number; value: T }[] {
  if (!rows.length || count <= 0) return [];
  const [lo, hi] = fameWindow(rows.length, difficulty);
  const chosen = shuffle(range(lo, hi), rng).slice(0, count);
  if (chosen.length < count) {
    const outside = [...range(0, lo), ...range(hi, rows.length)];
    chosen.push(...shuffle(outside, rng).slice(0, count - chosen.length));
  }
  return chosen.map((index) => ({ index, value: rows[index] }));
}
