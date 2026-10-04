// Ports of Models/StreakCalculator.swift and Models/StatsAggregator.swift.
import { addDays, dateKey } from "./dates";
import { DIFFICULTIES, type Difficulty } from "./difficulty";

/** One finished quiz — the shape of the app's QuizAttempt. */
export interface Attempt {
  id: string;
  /** ISO timestamp. */
  finishedAt: string;
  quizId: string;
  /** Denormalized so history stays readable if a quiz is renamed. */
  quizTitle: string;
  difficulty: Difficulty;
  total: number;
  correct: number;
  durationMs: number;
  timedOut: number;
  /** Local date of the start, YYYY-MM-DD. */
  dayKey: string;
}

/**
 * Streaks derived from the days with at least one attempt — never a stored
 * counter. The current streak counts back from the latest active day, which
 * must be today or yesterday (otherwise everyone sees "0 day streak" every
 * morning before they play).
 */
export function streaks(dayKeys: Iterable<string>, today = dateKey()): { current: number; longest: number } {
  const days = [...new Set(dayKeys)].sort();
  if (!days.length) return { current: 0, longest: 0 };

  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    run = addDays(days[i - 1], 1) === days[i] ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  const latest = days[days.length - 1];
  let current = 0;
  if (latest === today || addDays(latest, 1) === today) {
    const active = new Set(days);
    for (let d = latest; active.has(d); d = addDays(d, -1)) current++;
  }
  return { current, longest };
}

export type Range = "W" | "M" | "6M" | "Y";
export const RANGES: { id: Range; name: string; days: number; label: string }[] = [
  { id: "W", name: "W", days: 7, label: "Last 7 days" },
  { id: "M", name: "M", days: 30, label: "Last 30 days" },
  { id: "6M", name: "6M", days: 182, label: "Last 6 months" },
  { id: "Y", name: "Y", days: 365, label: "Last year" },
];

const accuracy = (rows: Attempt[]) => {
  const asked = rows.reduce((n, a) => n + a.total, 0);
  return asked ? (rows.reduce((n, a) => n + a.correct, 0) / asked) * 100 : 0;
};

export function inRange(attempts: Attempt[], days: number, now = new Date()): Attempt[] {
  const cutoff = now.getTime() - days * 86_400_000;
  return attempts.filter((a) => new Date(a.finishedAt).getTime() >= cutoff);
}

export function overview(attempts: Attempt[]) {
  return {
    quizzes: attempts.length,
    questions: attempts.reduce((n, a) => n + a.total, 0),
    accuracy: accuracy(attempts),
  };
}

export interface DailyPoint {
  day: string;
  quizzes: number;
  accuracy: number;
}

/** One point per day in the range, including empty days, so charts keep an even time axis. */
export function dailySeries(attempts: Attempt[], days: number, today = dateKey()): DailyPoint[] {
  const byDay = new Map<string, Attempt[]>();
  for (const a of attempts) byDay.set(a.dayKey, [...(byDay.get(a.dayKey) ?? []), a]);
  return Array.from({ length: days }, (_, i) => {
    const day = addDays(today, i - days + 1);
    const rows = byDay.get(day) ?? [];
    return { day, quizzes: rows.length, accuracy: accuracy(rows) };
  });
}

export function byDifficulty(attempts: Attempt[]) {
  return DIFFICULTIES.map((difficulty) => {
    const rows = attempts.filter((a) => a.difficulty === difficulty);
    return { difficulty, accuracy: accuracy(rows), rounds: rows.length };
  }).filter((r) => r.rounds > 0);
}

/** Best and worst quizzes, needing a few attempts so one lucky round doesn't top the list. */
export function standings(attempts: Attempt[], minimumAttempts = 2) {
  const grouped = new Map<string, Attempt[]>();
  for (const a of attempts) grouped.set(a.quizTitle, [...(grouped.get(a.quizTitle) ?? []), a]);
  const ranked = [...grouped]
    .filter(([, rows]) => rows.length >= minimumAttempts)
    .map(([title, rows]) => ({ title, attempts: rows.length, accuracy: accuracy(rows) }))
    .sort((a, b) => b.accuracy - a.accuracy);
  return { strongest: ranked.slice(0, 5), weakest: ranked.slice(-5).reverse() };
}
