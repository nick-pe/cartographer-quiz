import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router";
import { Layout } from "./components/Layout";
import { useStore } from "./lib/store";
import { Daily } from "./screens/Daily";
import { Home } from "./screens/Home";
import { Quiz } from "./screens/Quiz";
import { Settings } from "./screens/Settings";
import { Trends } from "./screens/Trends";

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

export function App() {
  useTheme();
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/daily" element={<Daily />} />
        <Route path="/quiz/:slug" element={<Quiz />} />
        <Route path="/trends" element={<Trends />} />
        <Route path="/settings" element={<Settings />} />
        {/* Links from the first version of the site. */}
        <Route path="/history" element={<Navigate to="/trends" replace />} />
        <Route path="/speed/*" element={<Navigate to="/quiz/speed-run" replace />} />
        <Route path="/play/:kind/*" element={<LegacyPlay />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function LegacyPlay() {
  const { pathname } = useLocation();
  const kind = pathname.split("/")[2];
  const to = kind === "flags" ? "/quiz/flags" : kind === "capitals" ? "/quiz/world-capitals" : "/";
  return <Navigate to={to} replace />;
}
