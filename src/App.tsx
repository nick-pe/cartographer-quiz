import { Suspense, useEffect, useRef, type ReactElement } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router";
import { Layout } from "./components/Layout";
import { LocaleProvider, useI18n } from "./i18n";
import { LOCALES, localeFromPath, localizePath, preferredLocale } from "./i18n/locales";
import { getState, useStore } from "./lib/store";
import { Daily } from "./screens/Daily";
import { Home } from "./screens/Home";
import { Learn } from "./screens/Learn";
import { Privacy, Support } from "./screens/Legal";
import { Quiz } from "./screens/Quiz";
import { Settings } from "./screens/Settings";
import { Trends } from "./screens/Trends";

/** Every page exists once per language: /daily, /fr/daily, /zh/daily… */
const PAGES: [string, ReactElement][] = [
  ["/", <Home />],
  ["/daily", <Daily />],
  ["/quiz/:slug", <Quiz />],
  ["/trends", <Trends />],
  ["/settings", <Settings />],
  ["/learn", <Learn />],
  ["/learn/:slug", <Learn />],
  ["/support", <Support />],
  ["/privacy", <Privacy />],
];

function useTheme() {
  const theme = useStore((s) => s.settings.theme);
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && media.matches);
      document.documentElement.dataset.theme = dark ? "dark" : "light";
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
}

/**
 * On arrival at an English (unprefixed) URL, switch to the visitor's language:
 * the one they picked before, or else their browser's. Runs once per visit, and
 * never overrides a URL that already names a language.
 */
function useLanguageRedirect() {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    if (localeFromPath(pathname) !== "en") return;
    const target = getState().settings.language ?? preferredLocale(navigator.languages ?? [navigator.language]);
    if (target !== "en") navigate(localizePath(pathname, target) + search + hash, { replace: true });
  }, [pathname, search, hash, navigate]);
}

export function App() {
  useTheme();
  useLanguageRedirect();
  const { pathname } = useLocation();
  // Braces matter: Chrome's scrollTo now returns a Promise, and an effect's
  // return value is called as its cleanup, which crashed every navigation.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Suspense>
      <LocaleProvider>
        <Layout>
          <Routes>
            {LOCALES.flatMap((l) => PAGES.map(([path, element]) => <Route key={l.code + path} path={localizePath(path, l.code)} element={element} />))}
            {/* Links from the first version of the site. */}
            <Route path="/history" element={<Navigate to="/trends" replace />} />
            <Route path="/speed/*" element={<Navigate to="/quiz/speed-run" replace />} />
            <Route path="/play/:kind/*" element={<LegacyPlay />} />
            <Route path="*" element={<ToHome />} />
          </Routes>
        </Layout>
      </LocaleProvider>
    </Suspense>
  );
}

function ToHome() {
  const { path } = useI18n();
  return <Navigate to={path("/")} replace />;
}

function LegacyPlay() {
  const { pathname } = useLocation();
  const kind = pathname.split("/")[2];
  const to = kind === "flags" ? "/quiz/flags" : kind === "capitals" ? "/quiz/world-capitals" : "/";
  return <Navigate to={to} replace />;
}
