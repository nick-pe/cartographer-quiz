// The active language comes from the URL (/fr/…); this module turns the
// engine's language-neutral questions and quiz ids into text in that language.
import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useLocation } from "react-router";
import { COUNTRIES } from "../data/ios/countries";
import { CATEGORY_BY_ID } from "../lib/engine/categories";
import type { Prompt, Question, Term } from "../lib/engine/question";
import type { QuizDef } from "../lib/engine/quizzes";
import { de } from "./de";
import { en, type Messages, type Unit } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { it } from "./it";
import { ko } from "./ko";
import { SITE_URL } from "../lib/site";
import { shareText } from "../lib/engine/daily";
import { LOCALES, localeFromPath, localeInfo, localizePath, stripLocale, type LocaleCode, type LocaleInfo } from "./locales";
import { PLACES, type Places } from "./places";
import { tl } from "./tl";
import { zh } from "./zh";

export const MESSAGES: Record<LocaleCode, Messages> = { en, de, fr, es, it, zh, ko, tl };

const CODE_BY_COUNTRY: Record<string, string> = Object.fromEntries(COUNTRIES.map((c) => [c.name, c.code]));

/** The app's `RegionInfo.country` strings, as ISO codes for the browser's country names. */
export const REGION_COUNTRY_CODES: Record<string, string | null> = {
  "the United States": "US", Germany: "DE", France: "FR", Italy: "IT", Spain: "ES", Canada: "CA",
  "the United Kingdom": "GB", England: null, Austria: "AT", Switzerland: "CH", "the Netherlands": "NL",
  Belgium: "BE", Poland: "PL", Portugal: "PT", Russia: "RU", Mexico: "MX", Japan: "JP", "South Korea": "KR",
  China: "CN", Norway: "NO", Sweden: "SE", Greece: "GR", Ireland: "IE", India: "IN", Brazil: "BR",
  Argentina: "AR", Colombia: "CO", Australia: "AU", "New Zealand": "NZ", "South Africa": "ZA", Nigeria: "NG",
  Morocco: "MA", Indonesia: "ID", Pakistan: "PK", Malaysia: "MY", "the Philippines": "PH", Hungary: "HU",
  Finland: "FI", Romania: "RO", Venezuela: "VE", Ecuador: "EC", Chile: "CL",
};

export interface I18n {
  code: LocaleCode;
  info: LocaleInfo;
  t: Messages;
  /** A name in running text ("le Nil") or standing alone as an option ("Nil"). */
  name: (term: Term, as?: "text" | "option") => string;
  /** An answer option of a question, in this language. */
  option: (q: Question, id: string) => string;
  prompt: (p: Prompt) => string;
  quizTitle: (quiz: Pick<QuizDef, "id" | "title">) => string;
  quizSubtitle: (quiz: QuizDef) => string;
  /** A site path in this language: "/daily" → "/fr/daily". */
  path: (p: string) => string;
  /** The Daily's spoiler-free share text, linking to this language's site. */
  dailyShare: (day: string, grid: boolean[], streak: number) => string;
  number: (n: number, options?: Intl.NumberFormatOptions) => string;
  date: (day: string, options: Intl.DateTimeFormatOptions) => string;
}

export function createI18n(code: LocaleCode): I18n {
  const info = localeInfo(code);
  const t = MESSAGES[code];
  const places: Places = PLACES[code];
  const regionNames = new Intl.DisplayNames([info.intl, "en"], { type: "region" });
  const numbers = new Intl.NumberFormat(info.intl);

  const countryName = (id: string): string => {
    if (code === "en") return id;
    const iso = CODE_BY_COUNTRY[id];
    return (iso && (places.countries?.[iso] ?? regionNames.of(iso))) || id;
  };

  const name = (term: Term, as: "text" | "option" = "text"): string => {
    switch (term.kind) {
      case "country": {
        const base = countryName(term.id);
        return term.qualifier ? `${base} (${t.qualifiers[term.qualifier] ?? term.qualifier})` : base;
      }
      case "capital":
      case "feature": {
        // Islands such as Madagascar or Iceland share their country's name.
        const local = places.names[term.id] ?? (CODE_BY_COUNTRY[term.id] ? countryName(term.id) : term.id);
        return as === "option" ? t.bare(local) : local;
      }
      case "number":
        return numbers.format(Number(term.id));
      case "local":
        return term.id;
    }
  };

  const regionCountry = (english: string): string => {
    if (code === "en") return english;
    const iso = REGION_COUNTRY_CODES[english];
    return t.extraCountries[english] ?? (iso ? (places.countries?.[iso] ?? regionNames.of(iso)) : null) ?? english;
  };

  const prompt = (p: Prompt): string => {
    switch (p.key) {
      case "howMany":
      case "pickRegion": {
        const info = CATEGORY_BY_ID[p.category].regionInfo!;
        // A locale may name one country's divisions specially (German Bundesländer, Korean 도).
        const unit: Unit = t.units[p.category] ?? t.units[info.unitSingular] ?? en.units[info.unitSingular];
        return t.prompts[p.key](unit, regionCountry(info.country));
      }
      case "longestRiver":
      case "highestMountain":
      case "largestSea":
      case "largestIsland":
      case "flagWhose":
        return t.prompts[p.key]();
      case "capitalOf":
        return t.prompts.capitalOf(name(p.place), p.place.kind === "country");
      default:
        return t.prompts[p.key](name(p.place));
    }
  };

  const key = (id: string) => id.replace(/^category\./, "");
  const titles = t.quizzes.titles as Record<string, string>;
  const subtitles = t.quizzes.subtitles as Record<string, string | ((n: number) => string)>;

  return {
    code,
    info,
    t,
    name,
    option: (q, id) => name({ kind: q.optionKind, id }, "option"),
    prompt,
    quizTitle: (quiz) => titles[key(quiz.id)] ?? quiz.title,
    quizSubtitle: (quiz) => {
      const category = CATEGORY_BY_ID[key(quiz.id)];
      if (category) return t.quizzes.count(category.count, t.quizzes.nouns[category.countNoun] ?? category.countNoun);
      const sub = subtitles[quiz.id];
      if (typeof sub === "function") return sub(Number(quiz.subtitle.match(/\d+/)?.[0] ?? 0));
      return sub ?? quiz.subtitle;
    },
    path: (p) => localizePath(p, code),
    dailyShare: (day, grid, streak) =>
      shareText(day, grid, streak, SITE_URL + (code === "en" ? "" : localizePath("/", code)), {
        title: t.share.dailyTitle,
        streak: t.share.streak,
        invite: t.share.invite,
        iphone: t.share.iphone,
      }),
    number: (n, options) => new Intl.NumberFormat(info.intl, options).format(n),
    date: (day, options) => new Date(`${day}T12:00:00`).toLocaleDateString(info.intl, options),
  };
}

const cache = new Map<LocaleCode, I18n>();
export function i18nFor(code: LocaleCode): I18n {
  if (!cache.has(code)) cache.set(code, createI18n(code));
  return cache.get(code)!;
}

const Context = createContext<I18n>(i18nFor("en"));

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const code = localeFromPath(pathname);
  const value = useMemo(() => i18nFor(code), [code]);
  useEffect(() => {
    document.documentElement.lang = code;
    document.querySelector('meta[name="description"]')?.setAttribute("content", value.t.site.description);
  }, [code, value]);
  useEffect(() => setAlternates(pathname), [pathname]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export const useI18n = () => useContext(Context);

/** Tells search engines this page's address in every language, and which one this is. */
function setAlternates(pathname: string) {
  const page = stripLocale(pathname);
  const link = (selector: string, attrs: Record<string, string>) => {
    let el = document.head.querySelector<HTMLLinkElement>(selector);
    if (!el) {
      el = document.createElement("link");
      document.head.append(el);
    }
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  };
  link('link[rel="canonical"]', { rel: "canonical", href: SITE_URL + pathname });
  for (const l of LOCALES) link(`link[hreflang="${l.code}"]`, { rel: "alternate", hreflang: l.code, href: SITE_URL + localizePath(page, l.code) });
  link('link[hreflang="x-default"]', { rel: "alternate", hreflang: "x-default", href: SITE_URL + page });
}
