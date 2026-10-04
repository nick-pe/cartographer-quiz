import type { Level, QuizKind } from "./levels";
import { drawSubjects, makeQuestion, type Question } from "./quiz";
import { hash, pick, seeded } from "./random";

export const DAILY_LENGTH = 10;
/** Daily #1. */
const EPOCH = "2026-09-14";
/** The puzzle gets harder as it goes. */
const RAMP: Level[] = ["explorer", "explorer", "explorer", "navigator", "navigator", "navigator", "navigator", "cartographer", "cartographer", "cartographer"];
const KINDS: QuizKind[] = ["capitals", "countries", "flags"];

/** The viewer's local calendar date as YYYY-MM-DD. */
export function dateKey(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function dayIndex(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
}

export function addDays(key: string, days: number): string {
  const t = new Date((dayIndex(key) + days) * 86_400_000);
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}-${String(t.getUTCDate()).padStart(2, "0")}`;
}

export function dailyNumber(key: string): number {
  return dayIndex(key) - dayIndex(EPOCH) + 1;
}

/**
 * The Daily Challenge for a date. Generated from the date alone, so everyone
 * gets the same ten questions with no server involved.
 */
export function dailyQuiz(key: string): Question[] {
  const rng = seeded(hash(`cartographer-daily-${key}`));
  const used = new Set<string>();
  return RAMP.map((level) => {
    const kind = pick(KINDS, rng);
    const [subject] = drawSubjects(kind, level, 1, rng, used);
    used.add(subject.code);
    return makeQuestion(subject, kind, level, rng);
  });
}

export function shareText(key: string, grid: boolean[], durationMs?: number): string {
  const score = grid.filter(Boolean).length;
  const squares = grid.map((ok) => (ok ? "🟩" : "🟥")).join("");
  const time = durationMs ? ` · ${formatDuration(durationMs)}` : "";
  return `Cartographer Daily #${dailyNumber(key)} — ${score}/${grid.length}${time}\n${squares}`;
}

export function formatDuration(ms: number): string {
  const total = Math.round(ms / 100) / 10;
  if (total < 60) return `${total.toFixed(1)}s`;
  const m = Math.floor(total / 60);
  const s = Math.floor(total % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
