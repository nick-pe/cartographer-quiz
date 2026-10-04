// Port of QuestionGenerator (Models/Question.swift) and GeoFeatureGenerator,
// plus the web-only flag questions.
import { COUNTRIES } from "../../data/ios/countries";
import { ISLANDS, MOUNTAINS, RIVERS, SEAS } from "../../data/ios/features";
import type { Country, SectionId } from "../../data/types";
import { pick, shuffle, type Rng } from "../random";
import { CATEGORY_LIST, type Category } from "./categories";
import { TIERS, type Difficulty } from "./difficulty";
import { pickDistractors, similarity } from "./distractors";
import { fameSample } from "./fameSlicer";
import { isPresent, make, orderedUnique, type Question, type QuestionSpec } from "./question";

// ---------------------------------------------------------------------------
// Capital-style questions

export function categoryQuestions(category: Category, difficulty: Difficulty, count = 10, rng?: Rng): Question[] {
  const all = category.pairs;
  if (!all.length) return [];
  // Fame-ordered and deduped, built from *all* pairs so a place that is never
  // asked about can still be a wrong answer.
  const pool = orderedUnique(all.map((p) => p.answer));
  // Skip rows whose answer is its own question ("What is the capital of Kyoto?").
  const askable = all.filter((p) => p.prompt !== p.answer);
  const source = askable.length ? askable : all;

  return fameSample(source, difficulty, count, rng)
    .map(({ value: pair }) =>
      make(
        {
          text: `${category.questionPrefix} ${pair.prompt}?`,
          correct: pair.answer,
          distractorPool: pool,
          correctRank: pool.indexOf(pair.answer),
          kind: "capital",
          quizId: category.id,
        },
        difficulty,
        rng,
      ),
    )
    .filter(isPresent);
}

// ---------------------------------------------------------------------------
// "How many regions?"

const DELTAS: Record<Difficulty, number[]> = {
  explorer: [-20, -15, -10, 7, 10, 15, 20, 25, 30],
  navigator: [-8, -6, -4, 3, 4, 6, 8, 10, 12],
  cartographer: [-4, -3, -2, -1, 1, 2, 3, 4, 5],
};

/** Distinct positive numbers including `correct`; harder tiers sit closer to it. */
function numericOptions(correct: number, count: number, difficulty: Difficulty, rng?: Rng): number[] {
  const values = new Set([correct]);
  for (const delta of shuffle(DELTAS[difficulty], rng)) {
    if (values.size >= count) break;
    if (correct + delta > 0) values.add(correct + delta);
  }
  for (let extra = correct + 1; values.size < count; extra++) values.add(extra);
  return shuffle([...values].sort((a, b) => a - b), rng);
}

export function countQuestions(difficulty: Difficulty, count = 10, rng?: Rng): Question[] {
  const categories = CATEGORY_LIST.filter((c) => c.regionInfo?.canonicalCount != null);
  return shuffle(categories, rng)
    .slice(0, count)
    .map((c) => {
      const info = c.regionInfo!;
      const correct = info.canonicalCount!;
      const numbers = numericOptions(correct, TIERS[difficulty].optionCount, difficulty, rng);
      return make(
        {
          text: `How many ${info.unitPlural} does ${info.country} have?`,
          correct: String(correct),
          fixedOptions: numbers.map(String),
          kind: "regionCount",
          quizId: c.id,
        },
        difficulty,
        rng,
      );
    })
    .filter(isPresent);
}

// ---------------------------------------------------------------------------
// "Which of these is a region of …?"

export function pickRegionQuestions(difficulty: Difficulty, count = 10, rng?: Rng): Question[] {
  const categories = CATEGORY_LIST.filter((c) => c.regionInfo && c.regionNames.length);
  return shuffle(categories, rng)
    .slice(0, count)
    .map((category) => {
      const info = category.regionInfo!;
      const correct = pick(category.regionNames, rng);
      if (correct === undefined) return null;
      // Names shared with this country are dropped (Limburg is in NL and BE).
      const own = new Set(category.regionNames);

      // ONE candidate per other country, so the pool isn't all US states.
      const candidates: { name: string; section: SectionId }[] = [];
      for (const other of categories) {
        if (other === category) continue;
        const names = other.regionNames.filter((n) => !own.has(n));
        if (!names.length) continue;
        let choice: string | undefined;
        if (difficulty === "explorer") choice = pick(names, rng);
        else {
          // Harder tiers field each country's closest lookalike (first maximum wins).
          choice = names[0];
          for (const n of names) if (similarity(correct, n) > similarity(correct, choice)) choice = n;
        }
        if (choice !== undefined) candidates.push({ name: choice, section: other.section });
      }

      // Harder tiers also draw from the same part of the world, where names are confusable.
      const sameArea = candidates.filter((c) => c.section === category.section);
      let chosen = candidates;
      if (difficulty === "navigator" && sameArea.length >= 3) {
        chosen = [...sameArea, ...shuffle(candidates.filter((c) => c.section !== category.section), rng).slice(0, 3)];
      } else if (difficulty === "cartographer" && sameArea.length >= 3) {
        chosen = sameArea;
      }

      const pool = shuffle(orderedUnique(chosen.map((c) => c.name)), rng);
      if (pool.length < 3) return null;
      return make(
        {
          text: `Which of these is a ${info.unitSingular} of ${info.country}?`,
          correct,
          distractorPool: pool,
          // Fame rank means nothing across countries' datasets; similarity drives closeness.
          correctRank: null,
          kind: "pickRegion",
          quizId: category.id,
        },
        difficulty,
        rng,
      );
    })
    .filter(isPresent);
}

// ---------------------------------------------------------------------------
// Flags (web only). Lookalike flags cluster by subregion, so harder tiers
// draw their wrong answers from the neighbourhood.

const NAMES = COUNTRIES.map((c) => c.name);

function flagDistractors(country: Country, rank: number, needed: number, difficulty: Difficulty, rng?: Rng): string[] {
  const others = COUNTRIES.filter((c) => c !== country);
  if (difficulty === "explorer") {
    return pickDistractors(country.name, rank, NAMES.filter((n) => n !== country.name), needed, difficulty, rng);
  }
  const subregion = shuffle(others.filter((c) => c.subregion === country.subregion), rng);
  const region = shuffle(others.filter((c) => c.region === country.region && c.subregion !== country.subregion), rng);
  const near = difficulty === "cartographer" ? [...subregion, ...region] : shuffle([...subregion, ...region], rng);
  const neighbours = near.slice(0, difficulty === "cartographer" ? needed : Math.ceil(needed / 2)).map((c) => c.name);
  const rest = pickDistractors(
    country.name,
    rank,
    NAMES.filter((n) => n !== country.name && !neighbours.includes(n)),
    needed - neighbours.length,
    difficulty,
    rng,
  );
  return [...neighbours, ...rest];
}

/** "Whose flag is this?" — a flag, pick the country. */
export function flagQuestions(difficulty: Difficulty, count = 10, rng?: Rng): Question[] {
  const needed = TIERS[difficulty].optionCount - 1;
  return fameSample(COUNTRIES, difficulty, count, rng)
    .map(({ index, value: country }) =>
      make(
        {
          text: "Whose flag is this?",
          correct: country.name,
          fixedOptions: [country.name, ...flagDistractors(country, index, needed, difficulty, rng)],
          kind: "flag",
          quizId: "flags",
          flag: country.code,
        },
        difficulty,
        rng,
      ),
    )
    .filter(isPresent);
}

/** "Which is the flag of …?" — a country, pick its flag. */
export function findFlagQuestions(difficulty: Difficulty, count = 10, rng?: Rng): Question[] {
  const needed = TIERS[difficulty].optionCount - 1;
  const codeOf = Object.fromEntries(COUNTRIES.map((c) => [c.name, c.code]));
  return fameSample(COUNTRIES, difficulty, count, rng)
    .map(({ index, value: country }) => {
      const options = [country.name, ...flagDistractors(country, index, needed, difficulty, rng)];
      return make(
        {
          text: `Which is the flag of ${country.name}?`,
          correct: country.name,
          fixedOptions: options,
          kind: "flag",
          quizId: "findTheFlag",
          optionFlags: Object.fromEntries(options.map((o) => [o, codeOf[o]])),
        },
        difficulty,
        rng,
      );
    })
    .filter(isPresent);
}

// ---------------------------------------------------------------------------
// Random mix

/** Two flag questions of each kind join the app's recipe on the web. */
const FLAGS_IN_MIX = 2;

export function randomMix(difficulty: Difficulty, count: number, rng?: Rng): Question[] {
  const pool: Question[] = [
    ...countQuestions(difficulty, 6, rng),
    ...pickRegionQuestions(difficulty, 6, rng),
  ];
  const mixable = CATEGORY_LIST.filter((c) => c.includeInRandomMix);
  for (const category of shuffle(mixable, rng).slice(0, 8)) pool.push(...categoryQuestions(category, difficulty, 2, rng));
  pool.push(...flagQuestions(difficulty, FLAGS_IN_MIX, rng), ...findFlagQuestions(difficulty, FLAGS_IN_MIX, rng));

  // Overlapping datasets (World ⊃ European Capitals) could ask the same thing twice.
  const seen = new Set<string>();
  return shuffle(pool, rng)
    .filter((q) => {
      const key = `${q.text}|${q.flag ?? ""}|${q.answer}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, count);
}

// ---------------------------------------------------------------------------
// Physical geography (port of GeoFeatureGenerator.swift)

/** Comparative templates need several facts at once, so Explorer skips them. */
function templates<T>(all: T[], comparative: T[], difficulty: Difficulty, rng?: Rng): T[] {
  if (difficulty === "explorer") {
    const simple = all.filter((t) => !comparative.includes(t));
    return simple.length ? shuffle(simple, rng) : all;
  }
  return shuffle(all, rng);
}

function featureQuiz<T, K>(
  corpus: readonly T[],
  kinds: K[],
  comparative: K[],
  build: (kind: K, item: T, rank: number) => Omit<QuestionSpec, "kind" | "quizId"> | null,
  quizId: string,
  difficulty: Difficulty,
  count: number,
  rng?: Rng,
): Question[] {
  const order = templates(kinds, comparative, difficulty, rng);
  return fameSample(corpus, difficulty, count, rng)
    .map(({ index, value }, position) => {
      const spec = build(order[position % order.length], value, index);
      return spec ? make({ ...spec, kind: "geoFeature", quizId }, difficulty, rng) : null;
    })
    .filter(isPresent);
}

/** "Which of these is the longest/highest/largest?" — options all strictly smaller than the answer. */
function comparative<T extends { name: string }>(item: T, corpus: readonly T[], size: (x: T) => number, text: string, difficulty: Difficulty, rng?: Rng) {
  const n = TIERS[difficulty].optionCount - 1;
  const others = corpus.filter((x) => x.name !== item.name && size(x) < size(item));
  if (others.length < n) return null;
  return { text, correct: item.name, fixedOptions: [item, ...shuffle(others, rng).slice(0, n)].map((x) => x.name) };
}

export function riverQuestions(difficulty: Difficulty, count = 10, rng?: Rng): Question[] {
  type K = "city" | "outflow" | "country" | "longest";
  return featureQuiz<(typeof RIVERS)[number], K>(
    RIVERS,
    ["city", "outflow", "country", "longest"],
    ["longest"],
    (kind, river, rank) => {
      switch (kind) {
        case "city": {
          const city = pick(river.cities, rng);
          if (!city) return null;
          // Don't offer a river that also has this city listed.
          return { text: `Which river flows through ${city}?`, correct: river.name, distractorPool: RIVERS.filter((r) => !r.cities.includes(city)).map((r) => r.name), correctRank: rank };
        }
        case "outflow":
          return { text: `Which body of water does the ${river.name} flow into?`, correct: river.outflow, distractorPool: RIVERS.map((r) => r.outflow).filter((o) => o !== river.outflow) };
        case "country": {
          const correct = pick(river.countries, rng);
          if (!correct) return null;
          const pool = RIVERS.flatMap((r) => r.countries).filter((c) => !river.countries.includes(c));
          return pool.length >= 3 ? { text: `Which of these countries does the ${river.name} flow through?`, correct, distractorPool: pool } : null;
        }
        case "longest":
          return comparative(river, RIVERS, (r) => r.lengthKm, "Which of these rivers is the longest?", difficulty, rng);
      }
    },
    "rivers",
    difficulty,
    count,
    rng,
  );
}

export function mountainQuestions(difficulty: Difficulty, count = 10, rng?: Rng): Question[] {
  type K = "country" | "range" | "highest";
  return featureQuiz<(typeof MOUNTAINS)[number], K>(
    MOUNTAINS,
    ["country", "range", "highest"],
    ["highest"],
    (kind, m) => {
      switch (kind) {
        case "country":
          // Only peaks wholly inside one country (Everest straddles two).
          if (m.countries.length !== 1) return null;
          return { text: `In which country is ${m.name}?`, correct: m.countries[0], distractorPool: MOUNTAINS.flatMap((x) => x.countries).filter((c) => c !== m.countries[0]) };
        case "range":
          if (!m.range) return null;
          return { text: `Which range is ${m.name} part of?`, correct: m.range, distractorPool: MOUNTAINS.map((x) => x.range).filter((r): r is string => !!r && r !== m.range) };
        case "highest":
          return comparative(m, MOUNTAINS, (x) => x.heightM, "Which of these mountains is the highest?", difficulty, rng);
      }
    },
    "mountains",
    difficulty,
    count,
    rng,
  );
}

export function seaQuestions(difficulty: Difficulty, count = 10, rng?: Rng): Question[] {
  type K = "border" | "connected" | "largest";
  return featureQuiz<(typeof SEAS)[number], K>(
    SEAS,
    ["border", "connected", "largest"],
    ["largest"],
    (kind, sea) => {
      switch (kind) {
        case "border": {
          const correct = pick(sea.borderingCountries, rng);
          if (!correct) return null;
          const pool = SEAS.flatMap((s) => s.borderingCountries).filter((c) => !sea.borderingCountries.includes(c));
          return pool.length >= 3 ? { text: `Which of these countries borders the ${sea.name}?`, correct, distractorPool: pool } : null;
        }
        case "connected":
          if (!sea.connectedTo) return null; // the Caspian
          return { text: `The ${sea.name} opens into which larger body of water?`, correct: sea.connectedTo, distractorPool: SEAS.map((s) => s.connectedTo).filter((c): c is string => !!c && c !== sea.connectedTo) };
        case "largest":
          return comparative(sea, SEAS, (s) => s.areaKm2, "Which of these seas is the largest by area?", difficulty, rng);
      }
    },
    "seas",
    difficulty,
    count,
    rng,
  );
}

export function islandQuestions(difficulty: Difficulty, count = 10, rng?: Rng): Question[] {
  type K = "country" | "water" | "largest";
  return featureQuiz<(typeof ISLANDS)[number], K>(
    ISLANDS,
    ["country", "water", "largest"],
    ["largest"],
    (kind, island) => {
      switch (kind) {
        case "country":
          // Shared islands (Borneo, Hispaniola) have several right answers.
          if (island.countries.length !== 1) return null;
          return { text: `Which country does ${island.name} belong to?`, correct: island.countries[0], distractorPool: ISLANDS.flatMap((i) => i.countries).filter((c) => c !== island.countries[0]) };
        case "water":
          return { text: `Which body of water surrounds ${island.name}?`, correct: island.water, distractorPool: ISLANDS.map((i) => i.water).filter((w) => w !== island.water) };
        case "largest":
          return comparative(island, ISLANDS, (i) => i.areaKm2, "Which of these islands is the largest?", difficulty, rng);
      }
    },
    "islands",
    difficulty,
    count,
    rng,
  );
}
