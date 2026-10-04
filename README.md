# Cartographer

A daily world geography quiz: the website version of the Cartographer iPhone app.

The **iOS app is the source of truth** for content and rules. This site imports the app's
data and ports its game engine, then adds a few web-only extras.

- **60 quizzes in 8 sections.** These are the app's 58 tiles: world and continental capitals, the regions of 40+ countries, Rivers, Mountains, Seas & Oceans, Islands, Random Mix, How Many Regions?, Spot the Region and Speed Run. On top of those, the web adds **Flags of the World** and **Find the Flag**.
- **Three tiers, one global picker.** They change which slice of the fame-ordered data is asked, the option count (4/5/6), how close the wrong answers are, and the clock:
  - Explorer: untimed
  - Navigator: 20 s
  - Cartographer: 12 s
- **Daily Challenge.** Ten Navigator questions from the Random Mix, the same for everyone. One attempt, a streak, and a spoiler-free grid to share. Numbering matches the app (#1 = 1 Jan 2026). The web seeds its own puzzle, so web #N is not the app's #N.
- **Speed Run.** Ten questions with +5 s per miss. Best time per tier.
- **Trends.** Overview, streak, Speed Run bests, accuracy and volume charts, accuracy by tier, and strongest/weakest quizzes.
- **Web-only extras:**
  - an answer review after every quiz
  - keyboard shortcuts (1–6 to answer, Enter to skip the reveal)
  - flag questions in the mixes
  - a light theme

Everything is stored in the browser's `localStorage` under `cartographer:v2`. Data from the first version (`cartographer:v1`) is migrated automatically. There are no accounts, analytics, cookies or third-party requests.

## Develop

```sh
npm install
npm run dev        # http://localhost:5173
npm test           # engine tests, ported from the app's test suite
npm run build      # static site in dist/
npm run data:ios   # re-import content from the app (expects ../geoquizz, or IOS_REPO=…)
```

## Layout

```
scripts/import-ios.mjs  parses the app's Swift data and descriptors into src/data/ios/ (generated, committed)
src/lib/engine/         port of the app's Models/: difficulty, FameSlicer, DistractorPicker,
                        QuestionGenerator, GeoFeatureGenerator, DailyChallenge, StreakCalculator,
                        StatsAggregator, plus the web's flag questions; no React
src/lib/store.ts        localStorage state and the v1 migration
src/components/         quiz runner, results, backdrop (port of GeoBackdrop), charts, UI primitives
src/screens/            Home, Quiz, Daily, Trends, Settings
public/                 support.html and privacy.html, icons, _redirects, flags/ (copied at build)
```

When the app's data changes, run `npm run data:ios` and commit the result. The script fails
loudly if the Swift files change shape.

## Deploy

**Main site: Cloudflare Pages.** Connect this repo in the Cloudflare dashboard:

- Workers & Pages → Create → Pages → Connect to Git
- Build command: `npm run build`
- Output directory: `dist`
- Node version: read from `.node-version` (22). If you set a `NODE_VERSION` variable, it overrides that file, so it must be exactly `22`.

Every push to `main` deploys, and every PR gets a preview URL. `public/_redirects` sends all
routes to the app, so links like `/quiz/german-states` and `/daily` work directly.

**Custom domain: cartographerquiz.com** (registered with Cloudflare). Pages project → Custom domains → Set up a domain.

- If you buy the domain with Cloudflare Registrar, DNS and HTTPS are configured for you.
- If you buy it elsewhere, point its nameservers at Cloudflare, or add the CNAME record Cloudflare shows you.

**GitHub Pages copy.** `.github/workflows/deploy.yml` tests the code on every push and PR.
On `main` it also publishes a copy to `nick-pe.github.io/cartographer-quiz/`. The App Store
listing's **Support URL** and **Privacy Policy URL** point there. Once the custom domain is live:

1. Change those two URLs in App Store Connect to the new domain.
2. Optionally retire the GitHub Pages deploy.

## Credits

Quiz content from the Cartographer iOS app.
Subregions from [mledoze/countries](https://github.com/mledoze/countries) (ODbL 1.0).
Flags from [flag-icons](https://github.com/lipis/flag-icons) (MIT).
