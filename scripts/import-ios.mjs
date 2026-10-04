// Imports the quiz content from the iOS app (the source of truth) into
// src/data/ios/*.ts. Run after the app's data changes:
//
//   npm run data:ios                 # expects the app at ../geoquizz
//   IOS_REPO=/path/to/geoquizz npm run data:ios
//
// The Swift files are parsed with a tiny literal parser, not compiled, so the
// script asserts the shapes it expects and fails loudly if they drift.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
// Only for subregions (flag lookalikes cluster by subregion). © Mohammed Le Doze, ODbL 1.0.
import worldCountries from "world-countries";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ios = process.env.IOS_REPO ?? join(root, "..", "geoquizz");
const src = join(ios, "Sources", "GeoQuizz");
const out = join(root, "src", "data", "ios");

const read = (...p) => readFileSync(join(src, ...p), "utf8");
const fail = (msg) => {
  console.error(`import-ios: ${msg}`);
  process.exit(1);
};
const expect = (cond, msg) => cond || fail(msg);

// ---------------------------------------------------------------------------
// A parser for the subset of Swift literals the data files use:
// strings, numbers, booleans, nil, .enumCase, arrays, Type(label: value, ...)
// calls, and dotted member paths (CountriesData.allCapitalPairs).

function stripComments(text) {
  let outText = "";
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      outText += c;
      if (c === "\\") outText += text[++i];
      else if (c === '"') inString = false;
    } else if (c === '"') {
      inString = true;
      outText += c;
    } else if (c === "/" && text[i + 1] === "/") {
      while (i < text.length && text[i] !== "\n") i++;
      outText += "\n";
    } else outText += c;
  }
  return outText;
}

function parser(text) {
  let i = 0;
  const ws = () => {
    while (i < text.length && /\s/.test(text[i])) i++;
  };
  const peek = () => (ws(), text[i]);
  const eat = (ch) => {
    ws();
    if (text[i] !== ch) fail(`expected '${ch}' at …${text.slice(i, i + 60)}`);
    i++;
  };
  const ident = () => {
    ws();
    const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(text.slice(i));
    if (!m) fail(`expected identifier at …${text.slice(i, i + 60)}`);
    i += m[0].length;
    return m[0];
  };
  function string() {
    eat('"');
    let s = "";
    while (text[i] !== '"') {
      if (text[i] === "\\") {
        const n = text[++i];
        s += n === "n" ? "\n" : n;
      } else s += text[i];
      i++;
    }
    i++;
    return s;
  }
  function list(close) {
    const items = [];
    while (peek() !== close) {
      // Labelled argument?
      const save = i;
      let label = null;
      if (/[A-Za-z_]/.test(peek())) {
        const name = ident();
        if (peek() === ":") {
          i++;
          label = name;
        } else i = save;
      }
      items.push({ label, value: value() });
      if (peek() === ",") i++;
    }
    eat(close);
    return items;
  }
  function value() {
    const c = peek();
    if (c === '"') return string();
    if (c === "[") {
      i++;
      return list("]").map((x) => x.value);
    }
    if (c === "(") {
      // A tuple, e.g. ("Bavaria", "Munich").
      i++;
      return { call: "", args: list(")") };
    }
    if (c === ".") {
      i++;
      return { case: ident() };
    }
    if (/[-0-9]/.test(c)) {
      const m = /^-?[0-9_]+(\.[0-9]+)?/.exec(text.slice(i));
      i += m[0].length;
      return Number(m[0].replaceAll("_", ""));
    }
    let name = ident();
    if (name === "nil") return null;
    if (name === "true" || name === "false") return name === "true";
    while (text[i] === ".") {
      i++;
      name += "." + ident();
    }
    if (peek() === "(") {
      i++;
      return { call: name, args: list(")") };
    }
    if (peek() === "{") {
      // A closure, e.g. `.map { GeoPair(prompt: $0.answer, answer: $0.prompt) }`.
      let depth = 0;
      const start = i;
      do {
        if (text[i] === "{") depth++;
        if (text[i] === "}") depth--;
        i++;
      } while (depth > 0);
      return { path: name, closure: text.slice(start, i) };
    }
    return { path: name };
  }
  return { value, at: (n) => (i = n), get pos() { return i; } };
}

/** Every `Type(...)` constructor call in `text`, as {label: value} objects. */
function calls(text, type) {
  const clean = stripComments(text);
  const results = [];
  const re = new RegExp(`\\b${type}\\(`, "g");
  let m;
  while ((m = re.exec(clean))) {
    // Skip the struct declaration and doc mentions like `Country(name:` in prose.
    const p = parser(clean);
    p.at(m.index);
    const v = p.value();
    if (v && v.call === type && v.args.every((a) => a.label)) {
      results.push(Object.fromEntries(v.args.map((a) => [a.label, a.value])));
      re.lastIndex = p.pos;
    }
  }
  return results;
}

const rgb = (color) => {
  expect(color?.call === "Color", `expected Color(...), got ${JSON.stringify(color)}`);
  const a = Object.fromEntries(color.args.map((x) => [x.label, x.value]));
  return [a.red, a.green, a.blue];
};

// ---------------------------------------------------------------------------
// Countries

const flagCode = (emoji) =>
  [...emoji].map((ch) => String.fromCharCode(ch.codePointAt(0) - 0x1f1e6 + 65)).join("");

const subregionOf = Object.fromEntries(worldCountries.map((c) => [c.cca2, c.subregion]));
const countries = calls(read("Data", "Countries.swift"), "Country").map((c) => ({
  name: c.name,
  capital: c.capital,
  region: c.region.case,
  subregion: subregionOf[flagCode(c.flag)],
  code: flagCode(c.flag),
  ...(c.capitalQualifier ? { capitalQualifier: c.capitalQualifier } : {}),
}));
expect(countries.length === 193, `expected 193 countries, got ${countries.length}`);
for (const c of countries) {
  expect(/^[A-Z]{2}$/.test(c.code), `bad flag for ${c.name}`);
  expect(c.subregion, `no subregion for ${c.name} (${c.code})`);
}

// ---------------------------------------------------------------------------
// (prompt, answer) datasets

const pairFiles = {};
for (const file of readdirSync(join(src, "Data")).sort()) {
  const text = stripComments(read("Data", file));
  const m = /enum\s+(\w+)Data\s*\{\s*static let pairs/.exec(text);
  if (!m) continue;
  const body = text.slice(text.indexOf("= [", m.index) + 2);
  const p = parser(body);
  const rows = p.value();
  expect(Array.isArray(rows), `${file}: pairs is not an array`);
  pairFiles[m[1]] = rows.map((row) => {
    expect(row?.args?.length === 2, `${file}: bad row ${JSON.stringify(row)}`);
    return [row.args[0].value, row.args[1].value];
  });
}

for (const [name, list] of Object.entries(pairFiles)) expect(list.length >= 4, `${name} has only ${list.length} rows`);
expect(new Set(pairFiles.FranceRegions.map((r) => r[1])).size === 13, "France should have 13 regions");

// ---------------------------------------------------------------------------
// Physical geography

const strip = (rows) =>
  rows.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v && v.case ? v.case : v])));
const rivers = strip(calls(read("Data", "Rivers.swift"), "River"));
const mountains = strip(calls(read("Data", "Mountains.swift"), "Mountain"));
const seas = strip(calls(read("Data", "Seas.swift"), "Sea"));
const islands = strip(calls(read("Data", "Islands.swift"), "Island"));
expect(rivers.length >= 20 && mountains.length >= 20 && seas.length >= 20 && islands.length >= 20, "geo feature data looks short");

// ---------------------------------------------------------------------------
// Categories

const categoryEnum = stripComments(read("Models", "QuizCategory.swift"));
const caseOrder = [...categoryEnum.slice(categoryEnum.indexOf("enum QuizCategory")).matchAll(/^\s*case (\w+)\s*$/gm)].map((m) => m[1]);
expect(caseOrder.length >= 40, `expected ~50 QuizCategory cases, got ${caseOrder.length}`);

const descText = stripComments(read("Models", "QuizCategoryDescriptor.swift"));
const table = descText.slice(descText.indexOf("func makeDescriptor"));
const caseRe = /case \.(\w+):\s*return QuizCategoryDescriptor\(/g;
const descriptors = {};
let cm;
while ((cm = caseRe.exec(table))) {
  const p = parser(table);
  p.at(cm.index + cm[0].length - "QuizCategoryDescriptor(".length);
  const v = p.value();
  descriptors[cm[1]] = Object.fromEntries(v.args.map((a) => [a.label, a.value]));
}

const capitalSource = {
  "CountriesData.allCapitalPairs": null,
  "CountriesData.europeCapitalPairs": "europe",
  "CountriesData.asiaCapitalPairs": "asia",
  "CountriesData.africaCapitalPairs": "africa",
  "CountriesData.americasCapitalPairs": "americas",
  "CountriesData.oceaniaCapitalPairs": "oceania",
};

function pairsSource(expr, id) {
  if (expr.path in capitalSource) return { capitals: capitalSource[expr.path] };
  if (expr.call === "GeoPair.list") {
    const name = expr.args[0].value.path.replace(/Data\.pairs$/, "");
    expect(pairFiles[name], `${id}: unknown dataset ${name}`);
    return { dataset: name };
  }
  if (expr.path?.endsWith("Data.pairs.map") && /prompt:\s*\$0\.answer,\s*answer:\s*\$0\.prompt/.test(expr.closure)) {
    return { dataset: expr.path.replace(/Data\.pairs\.map$/, ""), reversed: true };
  }
  fail(`${id}: can't read pairs expression ${JSON.stringify(expr)}`);
}

// Backdrop per category, from `extension QuizCategory { var backdropStyle … }`.
const backdropText = stripComments(read("Models", "QuizBackdrop.swift"));
const catBackdrop = backdropText.slice(backdropText.indexOf("extension QuizCategory"));
const backdropOf = {};
for (const m of catBackdrop.matchAll(/case ((?:\.\w+,?\s*)+):\s*return \.(\w+)/g)) {
  for (const id of m[1].match(/\w+/g)) backdropOf[id] = m[2];
}
const defaultBackdrop = /default:\s*return \.(\w+)/.exec(catBackdrop)?.[1];
expect(defaultBackdrop, "no default backdrop");

const categories = caseOrder.map((id) => {
  const d = descriptors[id];
  expect(d, `no descriptor for ${id}`);
  const info = d.regionInfo?.args && Object.fromEntries(d.regionInfo.args.map((a) => [a.label, a.value]));
  return {
    id,
    title: d.title,
    emoji: d.emoji,
    countNoun: d.countNoun,
    section: d.homeSection.case,
    gradient: d.gradient.map(rgb),
    source: pairsSource(d.pairs, id),
    questionPrefix: d.questionPrefix ?? "What is the capital of",
    regionInfo: info
      ? { country: info.country, unitSingular: info.unitSingular, unitPlural: info.unitPlural, canonicalCount: info.canonicalCount }
      : null,
    regionNameSource: d.regionNameSource?.case ?? "prompt",
    includeInRandomMix: d.includeInRandomMix ?? true,
    backdrop: backdropOf[id] ?? defaultBackdrop,
  };
});
expect(Object.keys(descriptors).length === caseOrder.length, "descriptor/case count mismatch");

// Section order is HomeSectionGroup's declaration order.
const sectionOrder = [...stripComments(read("Models", "HomeSectionGroup.swift")).matchAll(/case (\w+) = "([^"]+)"/g)].map((m) => ({
  id: m[1],
  title: m[2],
}));
expect(sectionOrder.some((s) => s.id === "naturalWorld"), "HomeSectionGroup changed");

// ---------------------------------------------------------------------------
// Write

const header = "// Generated by scripts/import-ios.mjs from the iOS app. Do not edit by hand.\n";
// One record per line keeps diffs readable when the app's data changes.
const rows = (items) => `[\n${items.map((x) => "  " + JSON.stringify(x)).join(",\n")},\n]`;
const pairsTs = Object.entries(pairFiles)
  .map(([name, list]) => `  ${name}: ${rows(list).replaceAll("\n  ", "\n    ").replace(/\n]$/, "\n  ]")}`)
  .join(",\n");
mkdirSync(out, { recursive: true });
writeFileSync(
  join(out, "countries.ts"),
  `${header}import type { Country } from "../types";\n\n/** The 193 UN member states, FAME-ORDERED: index 0 is the best known. */\nexport const COUNTRIES: Country[] = ${rows(countries)};\n`,
);
writeFileSync(
  join(out, "pairs.ts"),
  `${header}\n/** (prompt, answer) rows per dataset, in the app's order (often fame order). */\nexport const PAIRS: Record<string, [string, string][]> = {\n${pairsTs},\n};\n`,
);
writeFileSync(
  join(out, "features.ts"),
  `${header}import type { Island, Mountain, River, Sea } from "../types";\n\n` +
    `export const RIVERS: River[] = ${rows(rivers)};\n\nexport const MOUNTAINS: Mountain[] = ${rows(mountains)};\n\n` +
    `export const SEAS: Sea[] = ${rows(seas)};\n\nexport const ISLANDS: Island[] = ${rows(islands)};\n`,
);
writeFileSync(
  join(out, "categories.ts"),
  `${header}import type { CategoryDef, SectionDef } from "../types";\n\nexport const CATEGORIES: CategoryDef[] = ${rows(categories)};\n\nexport const SECTIONS: SectionDef[] = ${rows(sectionOrder)};\n`,
);

console.log(
  `import-ios: ${countries.length} countries, ${Object.keys(pairFiles).length} datasets, ` +
    `${categories.length} categories, ${rivers.length}/${mountains.length}/${seas.length}/${islands.length} rivers/mountains/seas/islands`,
);
