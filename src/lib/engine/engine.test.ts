// Ports of the app's test suites (Tests/CartographerTests), plus invariants
// over every web tile. A failure here is a question a player would see as broken.
import { describe, expect, it } from "vitest";
import { COUNTRIES } from "../../data/ios/countries";
import { ISLANDS, MOUNTAINS, RIVERS } from "../../data/ios/features";
import { seeded } from "../random";
import { CATEGORY_BY_ID, CATEGORY_LIST } from "./categories";
import { dailyNumber, dailyQuiz, shareText } from "./daily";
import { DIFFICULTIES, TIERS } from "./difficulty";
import { similarity } from "./distractors";
import { fameSample, fameWindow } from "./fameSlicer";
import { categoryQuestions, findFlagQuestions, flagQuestions, pickRegionQuestions, randomMix } from "./generators";
import type { Question } from "./question";
import { ALL_QUIZZES, HOME_SECTIONS, QUIZ_BY_SLUG } from "./quizzes";
import { formatSpeed } from "./speedRun";
import { byDifficulty, dailySeries, standings, streaks, type Attempt } from "./stats";

function wellFormed(q: Question) {
  expect(new Set(q.options).size, `duplicate options: ${q.text}`).toBe(q.options.length);
  expect(q.options, q.text).toContain(q.answer);
  expect(q.options.length, `too few options: ${q.text}`).toBeGreaterThanOrEqual(2);
}

describe("Fame slicer", () => {
  it("draws harder tiers from deeper in the list", () => {
    const [e] = fameWindow(100, "explorer");
    const [n] = fameWindow(100, "navigator");
    const [c, cEnd] = fameWindow(100, "cartographer");
    expect(e).toBe(0);
    expect(n).toBeGreaterThan(e);
    expect(c).toBeGreaterThan(n);
    expect(cEnd).toBe(100);
  });

  it("overlaps windows rather than making them disjoint", () => {
    expect(fameWindow(100, "navigator")[0]).toBeLessThan(fameWindow(100, "explorer")[1]);
  });

  it("uses every row of small datasets at every tier", () => {
    for (const d of DIFFICULTIES) expect(fameWindow(4, d)).toEqual([0, 4]);
  });

  it("always fills the requested count, and never overdraws", () => {
    const rows = Array.from({ length: 100 }, (_, i) => i);
    for (const d of DIFFICULTIES) {
      expect(fameSample(rows, d, 10)).toHaveLength(10);
      expect(fameSample(rows.slice(0, 12), d, 12)).toHaveLength(12);
      expect(new Set(fameSample(rows.slice(0, 12), d, 12).map((x) => x.index)).size).toBe(12);
    }
    expect(fameSample([1, 2, 3], "navigator", 10)).toHaveLength(3);
    expect(fameSample([], "navigator", 10)).toHaveLength(0);
  });
});

describe("Geographic data", () => {
  it("is the 193 UN member states, every continent represented", () => {
    expect(COUNTRIES).toHaveLength(193);
    expect(new Set(COUNTRIES.map((c) => c.name)).size).toBe(193);
    expect(new Set(COUNTRIES.map((c) => c.region)).size).toBe(5);
  });

  it("never puts an alternate capital in the answer pool", () => {
    const pool = new Set(COUNTRIES.map((c) => c.capital));
    for (const alt of ["La Paz", "Colombo", "Lobamba", "Cape Town", "Bloemfontein", "The Hague", "Abidjan", "Cotonou", "Dar es Salaam", "Putrajaya"]) {
      expect(pool.has(alt), alt).toBe(false);
    }
  });

  it("qualifies contested capitals", () => {
    const qualified = COUNTRIES.filter((c) => c.capitalQualifier).map((c) => c.name);
    for (const name of ["Bolivia", "Sri Lanka", "South Africa", "Eswatini", "Ivory Coast", "Benin"]) expect(qualified).toContain(name);
    expect(CATEGORY_BY_ID.worldCapitals.pairs.find((p) => p.answer === "Sucre")?.prompt).toBe("Bolivia (constitutional)");
  });

  it("gives every dataset enough rows to build a question", () => {
    for (const c of CATEGORY_LIST) {
      expect(c.pairs.length, c.title).toBeGreaterThanOrEqual(4);
      expect(c.pairs.filter((p) => p.prompt !== p.answer).length, c.title).toBeGreaterThanOrEqual(4);
      expect(new Set(c.pairs.map((p) => p.answer)).size, c.title).toBeGreaterThanOrEqual(4);
    }
  });

  it("derives card subtitles from the data", () => {
    expect(CATEGORY_BY_ID.worldCapitals.subtitle).toBe("193 countries");
    expect(CATEGORY_BY_ID.japanesePrefectures.subtitle).toBe("47 prefectures");
    expect(CATEGORY_BY_ID.franceRegions.subtitle).toBe("13 regions");
  });

  it("keeps continental tiles out of the random mix", () => {
    for (const id of ["europeanCapitals", "asianCapitals", "africanCapitals", "americasCapitals", "oceaniaCapitals"]) {
      expect(CATEGORY_BY_ID[id].includeInRandomMix).toBe(false);
    }
  });

  it("gives every home section an even number of tiles", () => {
    for (const s of HOME_SECTIONS) expect(s.quizzes.length % 2, s.title).toBe(0);
    // The app's 58 tiles plus the two flag quizzes.
    expect(ALL_QUIZZES).toHaveLength(60);
    expect(Object.keys(QUIZ_BY_SLUG)).toHaveLength(60);
  });

  it("has sane canonical region counts", () => {
    for (const c of CATEGORY_LIST) {
      const n = c.regionInfo?.canonicalCount;
      if (n == null) continue;
      expect(n).toBeGreaterThan(0);
      expect(c.pairs.length, c.title).toBeLessThanOrEqual(n + 1);
    }
  });
});

describe("Question generation", () => {
  it("makes well-formed questions for every tile at every tier", () => {
    for (const d of DIFFICULTIES) {
      for (const quiz of ALL_QUIZZES) {
        for (let seed = 0; seed < 5; seed++) {
          const questions = quiz.make(d, seeded(seed));
          expect(questions.length, `${quiz.title} @ ${d}`).toBeGreaterThan(0);
          questions.forEach(wellFormed);
        }
      }
    }
  });

  it("shows more options on harder tiers", () => {
    for (const d of DIFFICULTIES) {
      const counts = new Set(categoryQuestions(CATEGORY_BY_ID.worldCapitals, d, 6).map((q) => q.options.length));
      expect([...counts]).toEqual([TIERS[d].optionCount]);
      const flagCounts = new Set([...flagQuestions(d, 6), ...findFlagQuestions(d, 6)].map((q) => q.options.length));
      expect([...flagCounts]).toEqual([TIERS[d].optionCount]);
    }
  });

  it("clamps the option count for small datasets", () => {
    for (const d of DIFFICULTIES) {
      const questions = categoryQuestions(CATEGORY_BY_ID.ukNations, d, 4);
      expect(questions.length).toBeGreaterThan(0);
      for (const q of questions) expect(q.options).toHaveLength(4);
    }
  });

  it("never asks a question that contains its own answer", () => {
    for (const d of DIFFICULTIES) {
      for (const c of CATEGORY_LIST) {
        for (const q of categoryQuestions(c, d, 12)) {
          const prompt = q.text.replace(c.questionPrefix, "").replace("?", "").trim();
          expect(prompt, `giveaway: ${q.text}`).not.toBe(q.answer);
        }
      }
    }
  });

  it("gets more obscure with difficulty", () => {
    const names = COUNTRIES.map((c) => c.name);
    const averageRank = (d: (typeof DIFFICULTIES)[number]) => {
      const ranks = categoryQuestions(CATEGORY_BY_ID.worldCapitals, d, 40, seeded(7))
        .map((q) => names.findIndex((n) => q.text.includes(n)))
        .filter((i) => i >= 0);
      return ranks.reduce((a, b) => a + b, 0) / ranks.length;
    };
    expect(averageRank("explorer")).toBeLessThan(averageRank("cartographer"));
  });

  it("never repeats a question in a random mix", () => {
    for (const d of DIFFICULTIES) {
      for (let seed = 0; seed < 20; seed++) {
        const mix = randomMix(d, 15, seeded(seed));
        expect(new Set(mix.map((q) => `${q.text}|${q.flag}|${q.answer}`)).size).toBe(mix.length);
      }
    }
  });

  it("mixes flags into random mixes", () => {
    const kinds = new Set(Array.from({ length: 30 }, (_, s) => randomMix("navigator", 15, seeded(s))).flat().map((q) => q.kind));
    expect(kinds).toEqual(new Set(["capital", "regionCount", "pickRegion", "flag"]));
  });

  it("never offers a real region as a wrong answer in Spot the Region", () => {
    const withInfo = CATEGORY_LIST.filter((c) => c.regionInfo);
    for (const d of DIFFICULTIES) {
      for (const q of pickRegionQuestions(d, 30)) {
        const target = CATEGORY_BY_ID[q.quizId];
        expect(withInfo).toContain(target);
        const own = new Set(target.regionNames);
        for (const wrong of q.options.filter((o) => o !== q.answer)) expect(own.has(wrong), `${wrong} is in ${target.title}`).toBe(false);
      }
    }
  });

  it("answers comparative questions from their own options", () => {
    const sizes = [
      { quiz: QUIZ_BY_SLUG.rivers, word: "longest", size: new Map(RIVERS.map((r) => [r.name, r.lengthKm])) },
      { quiz: QUIZ_BY_SLUG.mountains, word: "highest", size: new Map(MOUNTAINS.map((m) => [m.name, m.heightM])) },
      { quiz: QUIZ_BY_SLUG.islands, word: "largest", size: new Map(ISLANDS.map((i) => [i.name, i.areaKm2])) },
    ];
    for (const d of DIFFICULTIES) {
      for (let i = 0; i < 20; i++) {
        for (const { quiz, word, size } of sizes) {
          for (const q of quiz.make(d).filter((q) => q.text.includes(word))) {
            expect(Math.max(...q.options.map((o) => size.get(o)!))).toBe(size.get(q.answer));
          }
        }
      }
    }
  });

  it("keeps comparative questions away from Explorer", () => {
    for (let i = 0; i < 20; i++) {
      for (const slug of ["rivers", "mountains", "seas", "islands"]) {
        for (const q of QUIZ_BY_SLUG[slug].make("explorer")) expect(q.text).not.toMatch(/longest|highest|largest/);
      }
    }
  });

  it("gives every flag question a flag", () => {
    for (const q of flagQuestions("cartographer", 20)) expect(q.flag).toMatch(/^[A-Z]{2}$/);
    for (const q of findFlagQuestions("cartographer", 20)) {
      for (const o of q.options) expect(q.optionFlags?.[o]).toMatch(/^[A-Z]{2}$/);
    }
  });

  it("scores lookalikes as similar", () => {
    expect(similarity("Córdoba", "cordoba")).toBe(1);
    expect(similarity("Sachsen", "Sachsen-Anhalt")).toBeGreaterThan(similarity("Sachsen", "Bayern"));
  });
});

describe("Daily challenge", () => {
  it("is the same quiz for the same day, option order included", () => {
    const a = dailyQuiz("2026-08-30");
    const b = dailyQuiz("2026-08-30");
    expect(a).toHaveLength(10);
    expect(b.map((q) => [q.text, q.options, q.answer])).toEqual(a.map((q) => [q.text, q.options, q.answer]));
  });

  it("differs from day to day", () => {
    const key = (q: Question) => `${q.text}|${q.flag}`;
    expect(dailyQuiz("2026-08-31").map(key)).not.toEqual(dailyQuiz("2026-08-30").map(key));
  });

  it("numbers puzzles from 1 January 2026, like the app", () => {
    expect(dailyNumber("2026-01-01")).toBe(1);
    expect(dailyNumber("2026-12-31")).toBe(365);
    expect(dailyNumber("2027-01-01")).toBe(366);
  });

  it("shares a spoiler-free grid in the app's format", () => {
    const grid = [true, true, false, true, true, true, false, true, true, true];
    const text = shareText("2026-10-04", grid, 6, "https://example.com");
    expect(text).toBe(
      "Cartographer Daily #277  8/10\n🟩🟩🟥🟩🟩🟩🟥🟩🟩🟩\n🔥 6 day streak\n\nThink you can beat that?\nhttps://example.com\niPhone: https://apps.apple.com/app/id6811782173",
    );
    for (const q of dailyQuiz("2026-10-04")) expect(text).not.toContain(q.answer);
    expect(shareText("2026-10-04", grid, 1, "")).not.toContain("streak");
  });
});

describe("Streaks", () => {
  it("handles empty history", () => expect(streaks([], "2026-08-29")).toEqual({ current: 0, longest: 0 }));
  it("counts consecutive days ending today", () => expect(streaks(["2026-08-27", "2026-08-28", "2026-08-29"], "2026-08-29").current).toBe(3));
  it("still counts a streak ending yesterday", () => expect(streaks(["2026-08-26", "2026-08-27", "2026-08-28"], "2026-08-29").current).toBe(3));
  it("breaks after a two-day gap", () => expect(streaks(["2026-08-26", "2026-08-27"], "2026-08-29").current).toBe(0));
  it.each([
    [["2026-02-28", "2026-03-01"], "2026-03-01", 2],
    [["2026-03-31", "2026-04-01"], "2026-04-01", 2],
    [["2025-12-31", "2026-01-01"], "2026-01-01", 2],
    [["2024-02-28", "2024-02-29", "2024-03-01"], "2024-03-01", 3],
  ])("crosses month and year boundaries %j", (keys, today, expected) => {
    expect(streaks(keys, today).current).toBe(expected);
  });
  it("finds the longest run even when the current one is shorter", () => {
    const s = streaks(["2026-08-01", "2026-08-02", "2026-08-03", "2026-08-04", "2026-08-10", "2026-08-28", "2026-08-29"], "2026-08-29");
    expect(s).toEqual({ current: 2, longest: 4 });
  });
});

describe("Stats", () => {
  const attempt = (dayKey: string, quizTitle: string, correct: number, difficulty: Attempt["difficulty"] = "explorer"): Attempt => ({
    id: dayKey + quizTitle + correct,
    finishedAt: `${dayKey}T12:00:00Z`,
    quizId: quizTitle,
    quizTitle,
    difficulty,
    total: 10,
    correct,
    durationMs: 1000,
    timedOut: 0,
    dayKey,
  });

  it("builds an even daily series including empty days", () => {
    const series = dailySeries([attempt("2026-10-04", "A", 8), attempt("2026-10-04", "B", 6), attempt("2026-10-02", "A", 10)], 7, "2026-10-04");
    expect(series).toHaveLength(7);
    expect(series.at(-1)).toEqual({ day: "2026-10-04", quizzes: 2, accuracy: 70 });
    expect(series.at(-2)?.quizzes).toBe(0);
  });

  it("ranks quizzes only after two attempts", () => {
    const s = standings([attempt("2026-10-01", "A", 9), attempt("2026-10-02", "A", 7), attempt("2026-10-02", "B", 2), attempt("2026-10-03", "C", 3), attempt("2026-10-04", "C", 1)]);
    expect(s.strongest.map((r) => r.title)).toEqual(["A", "C"]);
    expect(s.weakest[0].title).toBe("C");
  });

  it("breaks accuracy down by tier", () => {
    expect(byDifficulty([attempt("2026-10-01", "A", 5, "navigator")])).toEqual([{ difficulty: "navigator", accuracy: 50, rounds: 1 }]);
  });
});

describe("Speed run", () => {
  it("formats times like the app", () => {
    expect(formatSpeed(47_200)).toBe("47.2s");
    expect(formatSpeed(64_300)).toBe("1:04.3");
    expect(formatSpeed(60_000)).toBe("1:00.0");
  });

  it("is ten questions at the selected tier", () => {
    for (const d of DIFFICULTIES) {
      const qs = QUIZ_BY_SLUG["speed-run"].make(d, seeded(1));
      expect(qs).toHaveLength(10);
      for (const q of qs.filter((q) => q.kind !== "regionCount")) expect(q.options.length).toBeLessThanOrEqual(TIERS[d].optionCount);
    }
  });
});
