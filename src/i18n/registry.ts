// Each language's text is its own download, so a visitor only loads theirs.
// English ships with the app; src/main.tsx loads the page's language before
// starting, and the build and tests register every language up front (./all).
import { en, type Messages } from "./en";
import { en as enLegal, type LegalText } from "./legal/en";
import type { LocaleCode } from "./locales";
import type { Places } from "./places";

export interface LocaleBundle {
  messages: Messages;
  places: Places;
  legal: LegalText;
}

const loaded: Partial<Record<LocaleCode, LocaleBundle>> = { en: { messages: en, places: { names: {} }, legal: enLegal } };
const loaders = import.meta.glob<{ default: LocaleBundle }>("./bundles/*.ts");
const pending = new Map<LocaleCode, Promise<LocaleBundle>>();

export function registerLocale(code: LocaleCode, bundle: LocaleBundle) {
  loaded[code] = bundle;
}

export const isLoaded = (code: LocaleCode) => code in loaded;

export function localeBundle(code: LocaleCode): LocaleBundle {
  const bundle = loaded[code];
  if (!bundle) throw new Error(`The ${code} language isn't loaded yet`);
  return bundle;
}

export function loadLocale(code: LocaleCode): Promise<LocaleBundle> {
  if (loaded[code]) return Promise.resolve(loaded[code]);
  if (!pending.has(code)) {
    pending.set(
      code,
      loaders[`./bundles/${code}.ts`]().then((m) => {
        registerLocale(code, m.default);
        return m.default;
      }),
    );
  }
  return pending.get(code)!;
}
