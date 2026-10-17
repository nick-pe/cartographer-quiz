import { es as legal } from "../legal/es";
import { es as messages } from "../es";
import { es as places } from "../places/es";
import type { LocaleBundle } from "../registry";

export default { messages, places, legal } satisfies LocaleBundle;
