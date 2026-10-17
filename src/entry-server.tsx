// Build-time rendering. scripts/prerender.mjs calls these for every page in
// every language, so search engines and link previews (WhatsApp, iMessage,
// Discord…) get a real title, description, image and content without running
// JavaScript. In the browser the app then takes over (src/main.tsx).
import "./i18n/all";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import { App } from "./App";
import { i18nFor } from "./i18n/core";
import { LEGAL } from "./i18n/legal";
import { LOCALES, localeFromPath, localizePath, stripLocale } from "./i18n/locales";
import { ALL_QUIZZES, QUIZ_BY_SLUG } from "./lib/engine/quizzes";
import { LEARNABLE, capitalsOf } from "./lib/learn";
import { SITE_URL } from "./lib/site";

export { robots, sitemap } from "./seo";

/** Every page the build writes, in every language. */
export function routes(): string[] {
  const pages = [
    "/",
    "/daily",
    "/trends",
    "/settings",
    "/learn",
    "/support",
    "/privacy",
    ...ALL_QUIZZES.map((q) => `/quiz/${q.slug}`),
    ...LEARNABLE.map((q) => `/learn/${q.slug}`),
  ];
  return LOCALES.flatMap((l) => pages.map((p) => localizePath(p, l.code)));
}

export function render(url: string): string {
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  );
}

/** Open Graph wants underscores and a region: fr_FR. */
const OG_LOCALE: Record<string, string> = { en: "en_US", de: "de_DE", fr: "fr_FR", es: "es_ES", it: "it_IT", zh: "zh_CN", ja: "ja_JP", ko: "ko_KR", tl: "tl_PH" };

/** Legal text without its **bold** and [link](url) markup, cut to a search-result length. */
const plain = (s: string) => {
  const text = s.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  return text.length > 200 ? text.slice(0, 197).replace(/\s+\S*$/, "") + "…" : text;
};

const attr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** The language-specific <head> tags for a page. */
export function head(url: string): { lang: string; html: string } {
  const code = localeFromPath(url);
  const page = stripLocale(url);
  const i18n = i18nFor(code);
  const { t } = i18n;
  const [, section, slug] = page.split("/");
  const quiz = slug ? QUIZ_BY_SLUG[slug] : undefined;

  let title = t.site.title;
  let description = t.site.description;
  // Personal pages (your stats and settings) have nothing for search engines.
  let index = true;
  if (page === "/daily") [title, description] = [t.site.pageTitle(t.daily.title), t.seo.daily];
  else if (page === "/trends") [title, index] = [t.site.pageTitle(t.trends.title), false];
  else if (page === "/settings") [title, index] = [t.site.pageTitle(t.settings.title), false];
  else if (page === "/learn") [title, description] = [t.site.pageTitle(t.learn.index), t.seo.learnIndex];
  else if (page === "/support") [title, description] = [t.site.pageTitle(LEGAL[code].support.title), plain(LEGAL[code].support.dataBody)];
  else if (page === "/privacy") [title, description] = [t.site.pageTitle(LEGAL[code].privacy.title), plain(String(LEGAL[code].privacy.sections[0].blocks[0]))];
  else if (quiz && section === "quiz") {
    const name = i18n.quizTitle(quiz);
    [title, description] = [t.site.pageTitle(name), t.seo.quiz(name, i18n.quizSubtitle(quiz))];
  } else if (quiz && section === "learn") {
    const name = i18n.quizTitle(quiz);
    [title, description] = [t.site.pageTitle(t.seo.learnTitle(name, i18n.quizSubtitle(quiz), capitalsOf(quiz))), t.seo.learn(name, i18n.quizSubtitle(quiz))];
  }

  const canonical = SITE_URL + url;
  const image = `${SITE_URL}/og/${code}.png`;
  const tags = [
    `<title>${attr(title)}</title>`,
    `<meta name="description" content="${attr(description)}" />`,
    index ? "" : `<meta name="robots" content="noindex" />`,
    `<link rel="canonical" href="${attr(canonical)}" />`,
    ...LOCALES.map((l) => `<link rel="alternate" hreflang="${l.code}" href="${attr(SITE_URL + localizePath(page, l.code))}" />`),
    `<link rel="alternate" hreflang="x-default" href="${attr(SITE_URL + page)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Cartographer" />`,
    `<meta property="og:url" content="${attr(canonical)}" />`,
    `<meta property="og:title" content="${attr(title)}" />`,
    `<meta property="og:description" content="${attr(description)}" />`,
    `<meta property="og:image" content="${attr(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:locale" content="${OG_LOCALE[code]}" />`,
    ...LOCALES.filter((l) => l.code !== code).map((l) => `<meta property="og:locale:alternate" content="${OG_LOCALE[l.code]}" />`),
    `<meta name="twitter:card" content="summary_large_image" />`,
  ].filter(Boolean);
  return { lang: code, html: tags.map((tag) => `    ${tag}`).join("\n").trimStart() };
}

/** Words for the link-preview image (scripts/og-images.mjs). */
export function ogText(code: (typeof LOCALES)[number]["code"]) {
  const { t } = i18nFor(code);
  return { lang: code, tagline: t.home.tagline, daily: t.daily.title, quizzes: t.learn.index };
}
