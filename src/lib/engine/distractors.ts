// Port of Models/DistractorPicker.swift.
//
// Harder tiers pick wrong answers that are *close* to the right one, which is
// where most of the perceived difficulty comes from. Two cheap signals: fame
// proximity (Dushanbe next to Bishkek, not Paris) and string similarity
// (Sachsen / Sachsen-Anhalt).
import { shuffle, type Rng } from "../random";
import type { Difficulty } from "./difficulty";

/**
 * @param pool candidates, fame-ordered, deduped, correct answer removed (an index is a fame rank).
 * @param correctRank the correct answer's fame rank in its own dataset.
 */
export function pickDistractors(
  correct: string,
  correctRank: number | null,
  pool: readonly string[],
  count: number,
  difficulty: Difficulty,
  rng?: Rng,
): string[] {
  if (count <= 0 || !pool.length) return [];
  if (pool.length <= count) return shuffle(pool, rng).slice(0, count);

  switch (difficulty) {
    case "explorer": {
      // The famous head: wrong answers should look obviously wrong.
      const head = pool.slice(0, Math.max(count * 4, 12));
      return shuffle(head, rng).slice(0, count);
    }
    case "navigator": {
      // Half near the correct answer, half free.
      const nearCount = Math.floor(count / 2);
      const near = nearestByFame(correctRank, pool, Math.max(nearCount * 3, 6), rng);
      const picked = shuffle(near, rng).slice(0, nearCount);
      const rest = pool.filter((p) => !picked.includes(p));
      picked.push(...shuffle(rest, rng).slice(0, count - picked.length));
      return picked.slice(0, count);
    }
    case "cartographer": {
      // Score everything, keep a band of the closest, sample within it so replays differ.
      const scored = pool.map((candidate, index) => ({
        candidate,
        score: 0.6 * fameProximity(correctRank, index, pool.length) + 0.4 * similarity(correct, candidate),
      }));
      const band = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.max(count * 3, count + 2))
        .map((s) => s.candidate);
      return shuffle(band, rng).slice(0, count);
    }
  }
}

function fameProximity(correctRank: number | null, candidateRank: number, poolSize: number): number {
  if (correctRank === null || poolSize <= 1) return 0;
  return Math.max(0, 1 - Math.abs(correctRank - candidateRank) / poolSize);
}

/** Lowercased and diacritic-folded, so "Córdoba" and "Cordoba" compare equal. */
function normalize(s: string): string[] {
  return Array.from(s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase());
}

/** Cheap 0…1 blend of shared prefix, shared tokens and length closeness. */
export function similarity(a: string, b: string): number {
  const x = normalize(a);
  const y = normalize(b);
  if (!x.length || !y.length) return 0;
  const xs = x.join("");
  const ys = y.join("");
  if (xs === ys) return 1;

  let shared = 0;
  while (shared < x.length && shared < y.length && x[shared] === y[shared]) shared++;
  const longest = Math.max(x.length, y.length);
  const prefix = shared / longest;

  const tx = new Set(xs.split(" ").filter(Boolean));
  const ty = new Set(ys.split(" ").filter(Boolean));
  const union = new Set([...tx, ...ty]).size;
  const jaccard = union === 0 ? 0 : [...tx].filter((t) => ty.has(t)).length / union;

  const lengths = Math.min(x.length, y.length) / longest;
  return 0.4 * prefix + 0.4 * jaccard + 0.2 * lengths;
}

function nearestByFame(correctRank: number | null, pool: readonly string[], limit: number, rng?: Rng): string[] {
  if (correctRank === null) return shuffle(pool, rng).slice(0, limit);
  return pool
    .map((p, i) => ({ p, d: Math.abs(i - correctRank) }))
    .sort((a, b) => a.d - b.d) // stable, like the app
    .slice(0, limit)
    .map((x) => x.p);
}
