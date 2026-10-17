import { de as legal } from "../legal/de";
import { de as messages } from "../de";
import { de as places } from "../places/de";
import type { LocaleBundle } from "../registry";

export default { messages, places, legal } satisfies LocaleBundle;
