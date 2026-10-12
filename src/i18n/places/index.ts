// Names of capitals and natural features per language, keyed by the app's
// English name. Only names that differ from English are listed; anything
// missing falls back to English. Country names come from the browser
// (Intl.DisplayNames); `countries` overrides those by ISO code where needed.
//
// French, Spanish and Italian entries include the definite article where the
// language uses one in a sentence ("le Nil", "el Nilo", "il Nilo"); the
// locale's `bare()` strips it for answer buttons. A capitalised article
// ("Le Caire", "El Cairo") is part of the name and is kept.
import type { LocaleCode } from "../locales";
import { de } from "./de";
import { es } from "./es";
import { fr } from "./fr";
import { it } from "./it";
import { ko } from "./ko";
import { zh } from "./zh";

export interface Places {
  names: Record<string, string>;
  countries?: Record<string, string>;
}

export const PLACES: Record<LocaleCode, Places> = {
  en: { names: {} },
  de,
  fr,
  es,
  it,
  zh,
  ko,
  // Filipino usage keeps the English names of foreign places.
  tl: { names: {} },
};
