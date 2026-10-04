/** The path the site is served under: "/" on Cloudflare, "/cartographer-quiz/" on GitHub Pages. */
export const BASE = import.meta.env.BASE_URL;

/** Absolute URL of the site root, without a trailing slash, for share text. */
export const SITE_URL = typeof location === "undefined" ? "" : location.origin + BASE.replace(/\/$/, "");

/** A path inside the site, e.g. asset("flags/fr.svg"). */
export const asset = (path: string) => BASE + path;
