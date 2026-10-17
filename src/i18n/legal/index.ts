import type { LocaleCode } from "../locales";
import { de } from "./de";
import { en, type LegalText } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { it } from "./it";
import { pt } from "./pt";
import { ja } from "./ja";
import { ko } from "./ko";
import { tl } from "./tl";
import { zh } from "./zh";

export type { Block, LegalText } from "./en";

export const LEGAL: Record<LocaleCode, LegalText> = { en, de, fr, es, it, pt, zh, ja, ko, tl };
