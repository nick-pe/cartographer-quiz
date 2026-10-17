/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Served from the domain root on Cloudflare Pages. The GitHub Pages copy (which
// keeps the App Store's support and privacy URLs alive) is built with
// `vite build --base=/cartographer-quiz/`.
export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  // Lets the pre-render step find each language's file (scripts/prerender.mjs).
  build: { manifest: true },
  // Tests see every language, like the build does.
  // The engine tests sweep every quiz at every level: allow for a busy machine.
  test: { setupFiles: ["src/i18n/all.ts"], testTimeout: 30_000 },
});
