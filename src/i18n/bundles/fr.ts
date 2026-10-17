import { fr as legal } from "../legal/fr";
import { fr as messages } from "../fr";
import { fr as places } from "../places/fr";
import type { LocaleBundle } from "../registry";

export default { messages, places, legal } satisfies LocaleBundle;
