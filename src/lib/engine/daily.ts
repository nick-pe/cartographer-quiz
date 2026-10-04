// Port of Models/DailyChallenge.swift, with the web's own seeding: one
// puzzle a day, the same for every browser, with no server. The date is the
// seed. (The app seeds differently, so its puzzle #N is not this one.)
import { hash, seeded } from "../random";
import { dayIndex } from "./dates";
import type { Difficulty } from "./difficulty";
import { randomMix } from "./generators";
import type { Question } from "./question";
import { SITE_URL } from "../site";

/** Fixed for everyone, so scores and grids are comparable. */
export const DAILY_DIFFICULTY: Difficulty = "navigator";
export const DAILY_LENGTH = 10;
/** Puzzle #1, matching the app's numbering. */
const EPOCH = "2026-01-01";

export const APP_STORE_URL = "https://apps.apple.com/app/id6811782173";

export function dailyNumber(key: string): number {
  return dayIndex(key) - dayIndex(EPOCH) + 1;
}

export function dailyQuiz(key: string): Question[] {
  return randomMix(DAILY_DIFFICULTY, DAILY_LENGTH, seeded(hash(`cartographer-daily-${key}`)));
}

export const emojiGrid = (grid: boolean[]) => grid.map((ok) => (ok ? "🟩" : "🟥")).join("");

/** The app's share format (note the two spaces before the score), with the site and the App Store. */
export function shareText(key: string, grid: boolean[], streak: number, site = SITE_URL): string {
  const lines = [`Cartographer Daily #${dailyNumber(key)}  ${grid.filter(Boolean).length}/${grid.length}`, emojiGrid(grid)];
  if (streak > 1) lines.push(`🔥 ${streak} day streak`);
  lines.push("", "Think you can beat that?");
  if (site) lines.push(site);
  lines.push(`iPhone: ${APP_STORE_URL}`);
  return lines.join("\n");
}
