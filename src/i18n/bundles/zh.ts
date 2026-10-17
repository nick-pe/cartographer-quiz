import { zh as legal } from "../legal/zh";
import { zh as messages } from "../zh";
import { zh as places } from "../places/zh";
import type { LocaleBundle } from "../registry";

export default { messages, places, legal } satisfies LocaleBundle;
