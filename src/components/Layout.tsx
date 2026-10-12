import type { ReactNode } from "react";
import { NavLink } from "react-router";
import { useI18n } from "../i18n";
import { asset } from "../lib/site";
import { LanguagePicker } from "./LanguagePicker";
import { Logo } from "./Logo";
import { LocalLink } from "./ui";

export function Layout({ children }: { children: ReactNode }) {
  const { t, path } = useI18n();
  // Phones show icons (like the app's toolbar); wider screens show the labels.
  const nav = [
    { to: "/", label: t.nav.play, icon: <path d="M8 5.5v13l10-6.5z" fill="currentColor" stroke="none" /> },
    { to: "/trends", label: t.nav.trends, icon: <path d="M4 4v16h16M8 15l3.5-4.5 3 3L19 8" /> },
    {
      to: "/settings",
      label: t.nav.settings,
      icon: (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
        </>
      ),
    },
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-surface-line bg-[var(--bg-top)]/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-[860px] items-center justify-between gap-2 px-4 py-2.5 sm:gap-4">
          <LocalLink to="/" className="flex shrink-0 items-center gap-2.5 font-bold">
            <Logo className="size-8" />
            <span className="text-lg max-[380px]:hidden">Cartographer</span>
          </LocalLink>
          <nav className="flex min-w-0 items-center gap-0.5 text-sm font-semibold sm:gap-1">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={path(n.to)}
                end
                aria-label={n.label}
                title={n.label}
                className={({ isActive }) =>
                  `flex items-center rounded-lg px-2.5 py-1.5 transition sm:px-3 ${isActive ? "bg-fg/10 text-fg" : "text-fg-2 hover:text-fg"}`
                }
              >
                <svg viewBox="0 0 24 24" className="size-5 sm:hidden" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {n.icon}
                </svg>
                <span className="max-sm:hidden">{n.label}</span>
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
        <LocalLink className="hover:text-fg" to="/learn">{t.footer.study}</LocalLink>
        <span className="mx-2">·</span>
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
