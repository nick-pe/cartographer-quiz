import { useSyncExternalStore } from "react";
import { dateKey } from "./engine/dates";
import { isDifficulty, type Difficulty } from "./engine/difficulty";
import { streaks, type Attempt } from "./engine/stats";

export type Theme = "system" | "light" | "dark";

export interface DailyResult {
  grid: boolean[];
  /** What was chosen for each question; null when time ran out. */
  picks: (string | null)[];
  durationMs: number;
  /** Played before the 2026-10 update, when the Daily had different questions: no review. */
  legacy?: boolean;
}

export interface SpeedBest {
  ms: number;
  dayKey: string;
}

export interface State {
  settings: { recordHistory: boolean; theme: Theme; difficulty: Difficulty };
  /** Newest first. */
  attempts: Attempt[];
  daily: Record<string, DailyResult>;
  /** Per tier: times are only comparable within one. */
  speedBests: Partial<Record<Difficulty, SpeedBest>>;
}

export const STORAGE_KEY = "cartographer:v2";
const LEGACY_KEY = "cartographer:v1";
const MAX_ATTEMPTS = 2000;

const DEFAULT: State = {
  settings: { recordHistory: true, theme: "dark", difficulty: "explorer" },
  attempts: [],
  daily: {},
  speedBests: {},
};

interface LegacyState {
  settings?: { recordHistory?: boolean; theme?: Theme; level?: string };
  history?: { id: string; at: string; quiz: string; level: string | null; score: number; total: number; durationMs: number }[];
  daily?: Record<string, DailyResult>;
}

/** Carries the first web version's history, settings and Daily results forward. */
export function migrateV1(old: LegacyState): State {
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return {
    settings: {
      recordHistory: old.settings?.recordHistory ?? true,
      theme: old.settings?.theme ?? "system",
      difficulty: isDifficulty(old.settings?.level) ? old.settings.level : "explorer",
    },
    attempts: (old.history ?? []).map((h) => ({
      id: h.id,
      finishedAt: h.at,
      quizId: h.quiz === "Daily Challenge" ? "dailyChallenge" : `legacy.${slug(h.quiz)}`,
      quizTitle: h.quiz,
      difficulty: isDifficulty(h.level) ? h.level : "navigator",
      total: h.total,
      correct: h.score,
      durationMs: h.durationMs,
      timedOut: 0,
      dayKey: dateKey(new Date(h.at)),
    })),
    daily: Object.fromEntries(Object.entries(old.daily ?? {}).map(([k, v]) => [k, { ...v, legacy: true }])),
    // Old bests were per quiz kind over 20 questions; not comparable with the new runs.
    speedBests: {},
  };
}

// Everything lives in this browser's localStorage. Nothing is sent anywhere.
function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<State>;
      return { ...DEFAULT, ...parsed, settings: { ...DEFAULT.settings, ...parsed.settings } };
    }
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const migrated = migrateV1(JSON.parse(legacy));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      localStorage.removeItem(LEGACY_KEY);
      return migrated;
    }
  } catch {
    // Corrupt or unavailable storage: start fresh in memory.
  }
  return DEFAULT;
}

let state = load();
const listeners = new Set<() => void>();

function set(next: State) {
  state = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode or storage full: keep working in memory.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStore<T>(select: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => select(state));
}

export function getState(): State {
  return state;
}

export function updateSettings(patch: Partial<State["settings"]>) {
  set({ ...state, settings: { ...state.settings, ...patch } });
}

export function recordAttempt(attempt: Omit<Attempt, "id" | "finishedAt">) {
  if (!state.settings.recordHistory) return;
  const full: Attempt = { ...attempt, id: crypto.randomUUID(), finishedAt: new Date().toISOString() };
  set({ ...state, attempts: [full, ...state.attempts].slice(0, MAX_ATTEMPTS) });
}

/** Daily results are kept even with history off: they enforce one attempt per day. First write wins. */
export function recordDaily(key: string, result: DailyResult) {
  if (state.daily[key]) return;
  set({ ...state, daily: { ...state.daily, [key]: result } });
}

/** Only a strictly faster time replaces a best. Saved only while history recording is on. */
export function recordSpeedRun(difficulty: Difficulty, ms: number): { isBest: boolean; previous: number | null } {
  const previous = state.speedBests[difficulty]?.ms ?? null;
  const isBest = previous === null || ms < previous;
  if (isBest && state.settings.recordHistory) {
    set({ ...state, speedBests: { ...state.speedBests, [difficulty]: { ms, dayKey: dateKey() } } });
  }
  return { isBest, previous };
}

export function deleteAllHistory() {
  set({ ...DEFAULT, settings: state.settings });
}

/** Streaks over days with any finished quiz, plus Daily days (kept even when recording is off). */
export function useStreaks() {
  const attempts = useStore((s) => s.attempts);
  const daily = useStore((s) => s.daily);
  return streaks([...attempts.map((a) => a.dayKey), ...Object.keys(daily)]);
}
