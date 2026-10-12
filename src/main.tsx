import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "@fontsource-variable/nunito";
import "./index.css";
import { App } from "./App";
import { BASE } from "./lib/site";

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
// Pre-rendered pages are taken over in place, so the first paint is the real one.
// (The GitHub Pages copy isn't pre-rendered and starts from an empty root.)
if (root.firstElementChild) hydrateRoot(root, app);
else createRoot(root).render(app);
