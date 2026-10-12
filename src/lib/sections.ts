// Home-screen section order per language. Readers of Asian languages see Asia
// first after World, and the Asian Capitals tile before the European one.
import type { LocaleCode } from "../i18n/locales";
import { HOME_SECTIONS, type QuizSection } from "./engine/quizzes";

const ASIA_FIRST: ReadonlySet<LocaleCode> = new Set(["zh", "ja", "ko", "tl"]);

function asiaFirst(sections: QuizSection[]): QuizSection[] {
  const asia = sections.find((s) => s.id === "asia");
  const rest = sections.filter((s) => s.id !== "asia");
  const at = rest.findIndex((s) => s.id === "europe");
  if (!asia || at < 0) return sections;
  const ordered = [...rest.slice(0, at), asia, ...rest.slice(at)];
  return ordered.map((s) => {
    if (s.id !== "world") return s;
    const quizzes = [...s.quizzes];
    const eu = quizzes.findIndex((q) => q.id === "category.europeanCapitals");
    const as = quizzes.findIndex((q) => q.id === "category.asianCapitals");
    if (eu >= 0 && as > eu) quizzes.splice(eu, 0, ...quizzes.splice(as, 1));
    return { ...s, quizzes };
  });
}

export function sectionsFor(code: LocaleCode): QuizSection[] {
  return ASIA_FIRST.has(code) ? asiaFirst(HOME_SECTIONS) : HOME_SECTIONS;
}
