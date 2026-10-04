import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Served from the domain root on Cloudflare Pages. The GitHub Pages copy (which
// keeps the App Store's support and privacy URLs alive) is built with
// `vite build --base=/cartographer-quiz/`.
export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
});
