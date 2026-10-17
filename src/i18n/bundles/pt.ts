import { pt as legal } from "../legal/pt";
import { pt as messages } from "../pt";
import { pt as places } from "../places/pt";
import type { LocaleBundle } from "../registry";

export default { messages, places, legal } satisfies LocaleBundle;
