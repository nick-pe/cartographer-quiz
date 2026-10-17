import { ko as legal } from "../legal/ko";
import { ko as messages } from "../ko";
import { ko as places } from "../places/ko";
import type { LocaleBundle } from "../registry";

export default { messages, places, legal } satisfies LocaleBundle;
