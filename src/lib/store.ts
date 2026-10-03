import { useSyncExternalStore } from "react";
import { addDays, dateKey } from "./daily";
import type { Level, QuizKind } from "./levels";

export type Theme = "system" | "light" | "dark";

export interface HistoryEntry {
  id: string;
  /** ISO timestamp. */
  at: string;
  quiz: string;
  level: Level | null;
  score: number;
  total: number;
  durationMs: number;
}

export interface DailyResult {
  grid: boolean[];
  /** What was chosen for each question; null when time ran out. */
  picks: (string | null)[];
  durationMs: number;
}

export interface State {
  settings: { recordHistory: boolean; theme: Theme; level: Level };
  history: HistoryEntry[];
  daily: Record<string, DailyResult>;
  speedBests: Partial<Record<QuizKind, number>>;
}

const KEY = "cartographer:v1";
const DEFAULT: State = {
  settings: { recordHistory: true, theme: "system", level: "explorer" },
  history: [],
  daily: {},
  speedBests: {},
};

// Everything lives in this browser's localStorage. Nothing is sent anywhere.
function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw) as Partial<State>;
    return { ...DEFAULT, ...parsed, settings: { ...DEFAULT.settings, ...parsed.settings } };
  } catch {
    return DEFAULT;
  }
}

let state = load();
const listeners = new Set<() => void>();

function set(next: State) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
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

export function recordResult(entry: Omit<HistoryEntry, "id" | "at">) {
  if (!state.settings.recordHistory) return;
  const full: HistoryEntry = { ...entry, id: crypto.randomUUID(), at: new Date().toISOString() };
  set({ ...state, history: [full, ...state.history].slice(0, 500) });
}

/** Daily results are kept even with history off: they enforce one attempt per day. */
export function recordDaily(key: string, result: DailyResult) {
  if (state.daily[key]) return;
  set({ ...state, daily: { ...state.daily, [key]: result } });
}

/** Returns true when this run set a new best. */
export function recordSpeedRun(kind: QuizKind, ms: number): boolean {
  const best = state.speedBests[kind];
  if (best !== undefined && best <= ms) return false;
  if (state.settings.recordHistory) set({ ...state, speedBests: { ...state.speedBests, [kind]: ms } });
  return true;
}

export function deleteAllHistory() {
  set({ ...DEFAULT, settings: state.settings });
}

/** Consecutive days with a finished Daily, counting back from today (or yesterday, if today is still open). */
export function streak(daily: Record<string, DailyResult>, today = dateKey()): number {
  let day = daily[today] ? today : addDays(today, -1);
  let count = 0;
  while (daily[day]) {
    count++;
    day = addDays(day, -1);
  }
  return count;
}

export function bestStreak(daily: Record<string, DailyResult>): number {
  const days = Object.keys(daily).sort();
  let best = 0;
  let run = 0;
  let prev = "";
  for (const d of days) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}
