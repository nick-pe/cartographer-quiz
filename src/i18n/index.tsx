// The active language comes from the URL (/fr/…).
import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useLocation } from "react-router";
import { SITE_URL } from "../lib/site";
import { i18nFor, type I18n } from "./core";
import { LOCALES, localeFromPath, localizePath, stripLocale } from "./locales";

export * from "./core";

const Context = createContext<I18n>(i18nFor("en"));

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const code = localeFromPath(pathname);
  const value = useMemo(() => i18nFor(code), [code]);
  useEffect(() => {
    document.documentElement.lang = code;
    document.querySelector('meta[name="description"]')?.setAttribute("content", value.t.site.description);
  }, [code, value]);
  useEffect(() => setAlternates(pathname), [pathname]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export const useI18n = () => useContext(Context);

/** Tells search engines this page's address in every language, and which one this is. */
function setAlternates(pathname: string) {
  const page = stripLocale(pathname);
  const link = (selector: string, attrs: Record<string, string>) => {
    let el = document.head.querySelector<HTMLLinkElement>(selector);
    if (!el) {
      el = document.createElement("link");
      document.head.append(el);
    }
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  };
  link('link[rel="canonical"]', { rel: "canonical", href: SITE_URL + pathname });
  for (const l of LOCALES) link(`link[hreflang="${l.code}"]`, { rel: "alternate", hreflang: l.code, href: SITE_URL + localizePath(page, l.code) });
  link('link[hreflang="x-default"]', { rel: "alternate", hreflang: "x-default", href: SITE_URL + page });
}
