import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "@fontsource-variable/nunito";
import "./index.css";
import { App } from "./App";
import { BASE } from "./lib/site";

// The first version used hash URLs (/#/daily); keep old links and bookmarks working.
if (location.hash.startsWith("#/")) history.replaceState(null, "", BASE + location.hash.slice(2));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={BASE.replace(/\/$/, "")}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
