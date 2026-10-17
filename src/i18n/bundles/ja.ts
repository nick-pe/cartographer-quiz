import { ja as legal } from "../legal/ja";
import { ja as messages } from "../ja";
import { ja as places } from "../places/ja";
import type { LocaleBundle } from "../registry";

export default { messages, places, legal } satisfies LocaleBundle;
