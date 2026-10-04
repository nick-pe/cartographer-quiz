import type { ReactNode } from "react";
import { Link, NavLink } from "react-router";
import { Logo } from "./Logo";

const nav = [
  { to: "/", label: "Play" },
  { to: "/history", label: "History" },
  { to: "/settings", label: "Settings" },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="chart-bg flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-[#f5f6fb]/75 backdrop-blur-lg dark:border-white/5 dark:bg-night/75">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5 font-bold tracking-tight">
            <Logo className="size-8" />
            <span className="text-lg max-[380px]:hidden">Cartographer</span>
          </Link>
          <nav className="flex gap-0.5 text-sm font-medium sm:gap-1">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end
                className={({ isActive }) =>
                  `rounded-lg px-2.5 py-1.5 transition sm:px-3 ${isActive ? "bg-violet-brand/10 text-violet-brand dark:bg-white/10 dark:text-white" : "text-slate-500 hover:text-ink dark:text-slate-400 dark:hover:text-white"}`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-6 sm:pt-10">{children}</main>
      <footer className="border-t border-black/5 py-6 text-center text-sm text-slate-500 dark:border-white/5 dark:text-slate-400">
        <a className="hover:text-violet-brand" href="./support.html">Support</a>
        <span className="mx-2">·</span>
        <a className="hover:text-violet-brand" href="./privacy.html">Privacy</a>
        <span className="mx-2">·</span>
        <span>No account, no tracking</span>
      </footer>
    </div>
  );
}
