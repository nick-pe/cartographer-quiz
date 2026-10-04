import { describe, expect, it } from "vitest";
import { COUNTRIES } from "../data/countries";
import { addDays, dailyNumber, dailyQuiz, shareText } from "./daily";
import { KIND_ORDER, LEVEL_ORDER, LEVELS } from "./levels";
import { makeQuiz } from "./quiz";
import { seeded } from "./random";
import { speedRun } from "./speedrun";
import { bestStreak, streak } from "./store";

describe("makeQuiz", () => {
  for (const kind of KIND_ORDER) {
    for (const level of LEVEL_ORDER) {
      it(`${kind}/${level}: valid, distinct questions`, () => {
        for (let seed = 0; seed < 50; seed++) {
          const quiz = makeQuiz(kind, level, 10, seeded(seed));
          expect(quiz).toHaveLength(10);
          expect(new Set(quiz.map((q) => q.subject.code)).size).toBe(10);
          for (const q of quiz) {
            expect(q.options).toHaveLength(LEVELS[level].options);
            expect(new Set(q.options).size).toBe(q.options.length);
            expect(q.options.filter((o) => o === q.answer)).toHaveLength(1);
            expect(LEVELS[level].tiers).toContain(q.subject.tier);
          }
        }
      });
    }
  }

  it("never asks about disputed or giveaway capitals", () => {
    for (let seed = 0; seed < 100; seed++) {
      for (const q of makeQuiz("capitals", "navigator", 10, seeded(seed))) expect(q.subject.capitalQuestions).toBe(true);
    }
  });

  it("Cartographer distractors come from the same subregion when it has enough countries", () => {
    const quiz = makeQuiz("flags", "cartographer", 20, seeded(7));
    for (const q of quiz) {
      const neighbours = COUNTRIES.filter((c) => c.subregion === q.subject.subregion).length;
      if (neighbours < LEVELS.cartographer.options) continue;
      for (const o of q.options) expect(COUNTRIES.find((c) => c.name === o)!.subregion).toBe(q.subject.subregion);
    }
  });
});

describe("daily", () => {
  it("is the same for everyone on a date and different the next day", () => {
    const a = dailyQuiz("2026-10-03").map((q) => q.prompt + q.options.join());
    const b = dailyQuiz("2026-10-03").map((q) => q.prompt + q.options.join());
    const c = dailyQuiz("2026-10-04").map((q) => q.prompt + q.options.join());
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
    expect(new Set(dailyQuiz("2026-10-03").map((q) => q.subject.code)).size).toBe(10);
  });

  it("numbers days from the epoch across month and DST boundaries", () => {
    expect(dailyNumber("2026-09-14")).toBe(1);
    expect(dailyNumber("2026-10-03")).toBe(20);
    expect(dailyNumber(addDays("2026-11-01", 1))).toBe(dailyNumber("2026-11-01") + 1);
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("shares a spoiler-free grid", () => {
    expect(shareText("2026-10-03", [true, false, true], 65_000)).toBe("Cartographer Daily #20 — 2/3 · 1:05\n🟩🟥🟩");
  });
});

describe("streaks", () => {
  const r = { grid: [], picks: [], durationMs: 0 };
  it("counts back from today, or from yesterday if today is open", () => {
    const daily = { "2026-10-01": r, "2026-10-02": r, "2026-10-03": r };
    expect(streak(daily, "2026-10-03")).toBe(3);
    expect(streak(daily, "2026-10-04")).toBe(3);
    expect(streak(daily, "2026-10-05")).toBe(0);
    expect(bestStreak({ ...daily, "2026-09-20": r })).toBe(3);
  });
});

describe("speed run", () => {
  it("has 20 four-option questions", () => {
    const run = speedRun("capitals", 1);
    expect(run).toHaveLength(20);
    for (const q of run) {
      expect(q.options).toHaveLength(4);
      expect(q.options).toContain(q.answer);
    }
  });
});
