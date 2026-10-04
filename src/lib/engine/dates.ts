// Day keys are the viewer's local calendar date as "YYYY-MM-DD". Arithmetic
// goes through UTC day numbers, so DST and month/year ends are real dates
// (the app's StreakCalculator makes the same point: 2026-03-01 minus one is
// not 2026-03-00).

export function dateKey(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function dayIndex(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
}

export function addDays(key: string, days: number): string {
  const t = new Date((dayIndex(key) + days) * 86_400_000);
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}-${String(t.getUTCDate()).padStart(2, "0")}`;
}
