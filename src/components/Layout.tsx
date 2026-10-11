import type { ReactNode } from "react";
import { NavLink } from "react-router";
import { useI18n } from "../i18n";
import { asset } from "../lib/site";
import { LanguagePicker } from "./LanguagePicker";
import { Logo } from "./Logo";
import { LocalLink } from "./ui";

export function Layout({ children }: { children: ReactNode }) {
  const { t, path } = useI18n();
  const nav = [
    { to: "/", label: t.nav.play },
    { to: "/trends", label: t.nav.trends },
    { to: "/settings", label: t.nav.settings },
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-surface-line bg-[var(--bg-top)]/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-[860px] items-center justify-between gap-2 px-4 py-2.5 sm:gap-4">
          <LocalLink to="/" className="flex shrink-0 items-center gap-2.5 font-bold">
            <Logo className="size-8" />
            <span className="text-lg max-sm:hidden">Cartographer</span>
          </LocalLink>
          <nav className="flex min-w-0 items-center gap-0.5 text-sm font-semibold sm:gap-1">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={path(n.to)}
                end
                className={({ isActive }) =>
                  `truncate rounded-lg px-2 py-1.5 transition sm:px-3 ${isActive ? "bg-fg/10 text-fg" : "text-fg-2 hover:text-fg"}`
                }
              >
                {n.label}
              </NavLink>
            ))}
            <span className="sm:hidden">
              <LanguagePicker compact />
            </span>
            <span className="max-sm:hidden">
              <LanguagePicker />
            </span>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[860px] flex-1 px-4 pb-16 pt-5 sm:pt-8">{children}</main>
      <footer className="border-t border-surface-line px-4 py-6 text-center text-sm text-fg-2">
        <a className="hover:text-fg" href={asset("support.html")}>{t.footer.support}</a>
        <span className="mx-2">·</span>
        <a className="hover:text-fg" href={asset("privacy.html")}>{t.footer.privacy}</a>
        <span className="mx-2">·</span>
        <a className="hover:text-fg" href="https://apps.apple.com/app/id6811782173">{t.footer.iphone}</a>
        <span className="mx-2">·</span>
        <span>{t.footer.noTracking}</span>
      </footer>
    </div>
  );
}
