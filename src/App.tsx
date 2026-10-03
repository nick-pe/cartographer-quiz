import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router";
import { Layout } from "./components/Layout";
import { useStore } from "./lib/store";
import { Home } from "./screens/Home";
import { Daily } from "./screens/Daily";
import { Practice } from "./screens/Practice";
import { SpeedRun } from "./screens/SpeedRun";
import { History } from "./screens/History";
import { Settings } from "./screens/Settings";

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
        <Route path="/play/:kind/:level" element={<Practice />} />
        <Route path="/speed/:kind" element={<SpeedRun />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Layout>
  );
}
