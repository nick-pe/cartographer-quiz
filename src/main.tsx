import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "@fontsource-variable/nunito";
import "./index.css";
import { App } from "./App";
import { localeFromPath, preferredLocale } from "./i18n/locales";
import { loadLocale } from "./i18n/registry";
import { BASE } from "./lib/site";
import { getState } from "./lib/store";

// The first version used hash URLs (/#/daily); keep old links and bookmarks working.
if (location.hash.startsWith("#/")) history.replaceState(null, "", BASE + location.hash.slice(2));

const app = (
  <StrictMode>
    <BrowserRouter basename={BASE.replace(/\/$/, "")}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
const root = document.getElementById("root")!;
// Start once the page's language has arrived, and the visitor's own if App is
// about to switch to it (see useLanguageRedirect), so neither shows a gap.
const here = localeFromPath(location.pathname);
const theirs = here === "en" ? (getState().settings.language ?? preferredLocale(navigator.languages ?? [navigator.language])) : here;
void Promise.all([loadLocale(here), loadLocale(theirs)]).then(() => {
  // Pre-rendered pages are taken over in place, so the first paint is the real one.
  // (The GitHub Pages copy isn't pre-rendered and starts from an empty root.)
  if (root.firstElementChild) hydrateRoot(root, app);
  else createRoot(root).render(app);
});
