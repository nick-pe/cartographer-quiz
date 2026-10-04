# Cartographer

A daily world geography quiz — the website version of the Cartographer iPhone app.

- **Daily Challenge** — ten questions, the same for everyone, generated from the date. One attempt, a streak, and a spoiler-free grid to share.
- **Practice** — Capitals, Countries and Flags at three levels:
  - **Explorer**: well-known places, four options, untimed.
  - **Navigator**: a wider pool, five options, 20 seconds.
  - **Cartographer**: obscure places, six options, 12 seconds, with wrong answers drawn from the same subregion.
- **Speed Run** — twenty questions against the clock, +5 s per miss, best times kept.
- **History & Settings** — results, streaks, a switch to stop recording, and Delete All History.

Everything is stored in the browser's `localStorage`. No accounts, analytics, cookies or third-party requests.

## Stack

Vite · React 19 · TypeScript · Tailwind CSS v4 · React Router (hash routing, so it runs on any static host) · Vitest.

## Develop

```sh
npm install
npm run dev       # http://localhost:5173
npm test
npm run build     # static site in dist/
```

## Layout

```
src/data/countries.ts   generated country list (npm run data)
src/lib/                quiz engine, daily seed, speed run, storage — no React
src/components/         quiz runner, results, UI primitives
src/screens/            one file per page
public/                 support.html and privacy.html (App Store URLs), flags/ (copied at build)
```

## Deploy

`.github/workflows/deploy.yml` tests, builds and publishes `dist/` to GitHub Pages on every push to `main`.
In the repo's **Settings → Pages**, set **Source** to **GitHub Actions**. For a custom domain, add it there
(and a `public/CNAME` file).

## Credits

Country data from [mledoze/countries](https://github.com/mledoze/countries) (ODbL 1.0).
Flags from [flag-icons](https://github.com/lipis/flag-icons) (MIT).
