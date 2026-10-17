import { it as legal } from "../legal/it";
import { it as messages } from "../it";
import { it as places } from "../places/it";
import type { LocaleBundle } from "../registry";

export default { messages, places, legal } satisfies LocaleBundle;
