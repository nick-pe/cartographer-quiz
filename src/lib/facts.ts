// The facts introduction of a study page, in the page's language.
import type { I18n } from "../i18n/core";
import { CATEGORY_BY_ID } from "./engine/categories";
import type { QuizDef } from "./engine/quizzes";
import { learnFacts, type Cell } from "./learn";

export function factText(i18n: I18n, quiz: Pick<QuizDef, "id">): string | null {
  const fact = learnFacts(quiz);
  if (!fact) return null;
  const f = i18n.t.facts;
  const n = i18n.number;
  const name = (term: Parameters<I18n["name"]>[0]) => i18n.name(term);
  const list = (xs: string[]) => new Intl.ListFormat(i18n.info.intl, { type: "conjunction" }).format(xs);
  switch (fact.kind) {
    case "capitals":
      return f.capitals(fact.count, fact.multiCapital.length, list(fact.multiCapital.map(name)));
    case "divisions":
      return f.divisions(fact.count, i18n.unitFor(fact.category).many, i18n.regionCountry(CATEGORY_BY_ID[fact.category].regionInfo!.country), fact.sameName);
    case "towns":
      return f.towns(fact.count, fact.groups, fact.groupsAreCountries);
    case "rivers":
      return f.rivers(fact.count, name(fact.longest), `${n(fact.longestKm)} km`, name(fact.shortest), `${n(fact.shortestKm)} km`);
    case "mountains":
      return f.mountains(fact.count, name(fact.highest), `${n(fact.highestM)} m`, fact.over8000, fact.ranges);
    case "seas":
      return f.seas(fact.count, name(fact.largest), `${n(fact.largestKm2)} km²`);
    case "islands":
      return f.islands(fact.count, name(fact.largest), `${n(fact.largestKm2)} km²`, fact.shared);
    case "flags":
      return f.flags(fact.count, list(fact.byRegion.map((r) => f.flagsPart(r.count, i18n.t.home.sections[r.region]))));
    case "howMany": {
      const side = (id: string) => [i18n.regionCountry(CATEGORY_BY_ID[id].regionInfo!.country), CATEGORY_BY_ID[id].regionInfo!.canonicalCount!, i18n.unitFor(id).many] as const;
      return f.howMany(...side(fact.most), ...side(fact.fewest));
    }
  }
}

/** One cell of a study table, as text. */
export function cellText(i18n: I18n, cell: Cell): string {
  if ("term" in cell) return i18n.name(cell.term, "option");
  if ("num" in cell) return i18n.number(cell.num) + (cell.unit ? ` ${cell.unit}` : "");
  if ("terms" in cell) return cell.terms.map((t) => i18n.name(t, "option")).join(", ");
  if ("regionCountry" in cell) return i18n.regionCountry(cell.regionCountry);
  return i18n.unitFor(cell.unitsOf).many;
}
