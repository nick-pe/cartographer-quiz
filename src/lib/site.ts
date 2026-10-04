/** The path the site is served under: "/" on Cloudflare, "/cartographer-quiz/" on GitHub Pages. */
export const BASE = import.meta.env.BASE_URL;

/** The canonical site, for share text. Shares from the GitHub Pages copy or localhost point here too. */
export const SITE_URL = "https://cartographerquiz.com";

/** A path inside the site, e.g. asset("flags/fr.svg"). */
export const asset = (path: string) => BASE + path;
