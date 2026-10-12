// The site's languages. English lives at the root (/daily); every other
// language under its own prefix (/fr/daily), so links can be shared in a
// specific language and search engines index each one.

export const LOCALES = [
  { code: "en", name: "English", intl: "en" },
  { code: "de", name: "Deutsch", intl: "de" },
  { code: "fr", name: "Français", intl: "fr" },
  { code: "es", name: "Español", intl: "es" },
  { code: "it", name: "Italiano", intl: "it" },
  { code: "zh", name: "中文", intl: "zh-Hans" },
  { code: "ja", name: "日本語", intl: "ja" },
  { code: "ko", name: "한국어", intl: "ko" },
  // Browsers know Tagalog's standard form as Filipino ("fil").
  { code: "tl", name: "Tagalog", intl: "fil" },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];
export type LocaleInfo = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: LocaleCode = "en";

export const isLocale = (x: unknown): x is LocaleCode => LOCALES.some((l) => l.code === x);
export const localeInfo = (code: LocaleCode): LocaleInfo => LOCALES.find((l) => l.code === code)!;

/** "/fr/daily" → "fr"; "/daily" → "en". */
export function localeFromPath(pathname: string): LocaleCode {
  const first = pathname.split("/")[1];
  return isLocale(first) && first !== DEFAULT_LOCALE ? first : DEFAULT_LOCALE;
}

/** "/fr/daily" → "/daily". */
export function stripLocale(pathname: string): string {
  const code = localeFromPath(pathname);
  if (code === DEFAULT_LOCALE) return pathname;
  return pathname.slice(code.length + 1) || "/";
}

/** ("/daily", "fr") → "/fr/daily"; ("/", "fr") → "/fr"; English has no prefix. */
export function localizePath(path: string, code: LocaleCode): string {
  if (code === DEFAULT_LOCALE) return path;
  return path === "/" ? `/${code}` : `/${code}${path}`;
}

/** The first supported language in the browser's preference list, if any. */
export function preferredLocale(languages: readonly string[]): LocaleCode {
  for (const tag of languages) {
    const primary = tag.toLowerCase().split("-")[0];
    if (primary === "fil") return "tl";
    if (isLocale(primary)) return primary;
  }
  return DEFAULT_LOCALE;
}
