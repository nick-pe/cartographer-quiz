// Every language at once, for the build (pre-rendering) and the tests.
import de from "./bundles/de";
import es from "./bundles/es";
import fr from "./bundles/fr";
import it from "./bundles/it";
import ja from "./bundles/ja";
import ko from "./bundles/ko";
import pt from "./bundles/pt";
import tl from "./bundles/tl";
import zh from "./bundles/zh";
import { registerLocale } from "./registry";

Object.entries({ de, es, fr, it, ja, ko, pt, tl, zh }).forEach(([code, bundle]) => registerLocale(code as "de", bundle));
