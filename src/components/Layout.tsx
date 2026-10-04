import type { ReactNode } from "react";
import { Link, NavLink } from "react-router";
import { asset } from "../lib/site";
import { Logo } from "./Logo";

const nav = [
  { to: "/", label: "Play" },
  { to: "/trends", label: "Trends" },
  { to: "/settings", label: "Settings" },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-surface-line bg-[var(--bg-top)]/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-[860px] items-center justify-between gap-4 px-4 py-2.5">
          <Link to="/" className="flex items-center gap-2.5 font-bold">
            <Logo className="size-8" />
            <span className="text-lg max-[360px]:hidden">Cartographer</span>
          </Link>
          <nav className="flex gap-0.5 text-sm font-semibold sm:gap-1">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end
                className={({ isActive }) => `rounded-lg px-2.5 py-1.5 transition sm:px-3 ${isActive ? "bg-fg/10 text-fg" : "text-fg-2 hover:text-fg"}`}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[860px] flex-1 px-4 pb-16 pt-5 sm:pt-8">{children}</main>
      <footer className="border-t border-surface-line py-6 text-center text-sm text-fg-2">
        <a className="hover:text-fg" href={asset("support.html")}>Support</a>
        <span className="mx-2">·</span>
        <a className="hover:text-fg" href={asset("privacy.html")}>Privacy</a>
        <span className="mx-2">·</span>
        <a className="hover:text-fg" href="https://apps.apple.com/app/id6811782173">iPhone app</a>
        <span className="mx-2">·</span>
        <span>No account, no tracking</span>
      </footer>
    </div>
  );
}
