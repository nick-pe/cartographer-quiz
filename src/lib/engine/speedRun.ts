// Port of Models/SpeedRun.swift.

/** Added per wrong answer. Without it the fastest strategy is tapping at random. */
export const PENALTY_PER_WRONG_MS = 5_000;

/** `1:04.3` / `47.2s` — the app's format. */
export function formatSpeed(ms: number): string {
  const seconds = ms / 1000;
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds - minutes * 60).toFixed(1).padStart(4, "0")}`;
  }
  return `${seconds.toFixed(1)}s`;
}

/** Plain durations for history rows: `12.3s` under a minute, otherwise `m:ss`. */
export function formatDuration(ms: number): string {
  const total = Math.round(ms / 100) / 10;
  if (total < 60) return `${total.toFixed(1)}s`;
  const m = Math.floor(total / 60);
  return `${m}:${String(Math.floor(total % 60)).padStart(2, "0")}`;
}
