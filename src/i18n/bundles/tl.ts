import { tl as legal } from "../legal/tl";
import type { LocaleBundle } from "../registry";
import { tl as messages } from "../tl";

// Tagalog uses the English names of places.
export default { messages, places: { names: {} }, legal } satisfies LocaleBundle;
