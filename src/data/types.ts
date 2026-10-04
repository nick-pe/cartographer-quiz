export type WorldRegion = "europe" | "asia" | "africa" | "americas" | "oceania";

export interface Country {
  name: string;
  capital: string;
  region: WorldRegion;
  /** UN geoscheme subregion, e.g. "Western Africa". Used to pick lookalike flags. */
  subregion: string;
  /** ISO 3166-1 alpha-2, also the flag file name. */
  code: string;
  /** For countries with more than one capital, which one is meant (e.g. Bolivia: "constitutional"). */
  capitalQualifier?: string;
}

export interface River {
  name: string;
  lengthKm: number;
  countries: string[];
  cities: string[];
  outflow: string;
  region: WorldRegion;
}

export interface Mountain {
  name: string;
  heightM: number;
  range: string | null;
  countries: string[];
  region: WorldRegion;
}

export interface Sea {
  name: string;
  borderingCountries: string[];
  connectedTo: string | null;
  areaKm2: number;
  region: WorldRegion;
}

export interface Island {
  name: string;
  countries: string[];
  water: string;
  areaKm2: number;
  region: WorldRegion;
}

export type SectionId = "world" | "europe" | "americas" | "asia" | "africa" | "oceania" | "naturalWorld";

export type BackdropId = "alpine" | "tropical" | "desert" | "ocean" | "arctic" | "city" | "temperate" | "river";

export interface RegionInfo {
  country: string;
  unitSingular: string;
  unitPlural: string;
  /** Undisputed number of units; null keeps the country out of "How Many Regions?". */
  canonicalCount: number | null;
}

/** One (prompt, answer) quiz, as described by the app's QuizCategoryDescriptor. */
export interface CategoryDef {
  id: string;
  title: string;
  emoji: string;
  countNoun: string;
  section: SectionId;
  /** Two RGB stops, 0–1. */
  gradient: [number, number, number][];
  source: { capitals: WorldRegion | null } | { dataset: string; reversed?: boolean };
  questionPrefix: string;
  regionInfo: RegionInfo | null;
  regionNameSource: "prompt" | "answer";
  includeInRandomMix: boolean;
  backdrop: BackdropId;
}

export interface SectionDef {
  id: SectionId;
  title: string;
}
