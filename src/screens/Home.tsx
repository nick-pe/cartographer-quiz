import type { ReactNode } from "react";
import { Link } from "react-router";
import { Card, LinkButton, Segmented } from "../components/ui";
import { Flag } from "../components/Flag";
import { DAILY_LENGTH, dailyNumber, dateKey, formatDuration } from "../lib/daily";
import { KIND_ORDER, KINDS, LEVEL_ORDER, LEVELS, type QuizKind } from "../lib/levels";
import { streak, updateSettings, useStore } from "../lib/store";

const ICONS: Record<QuizKind, ReactNode> = {
  capitals: (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M5 21V10m14 11V10M9 21v-6h6v6M2 10l10-6 10 6" />
    </svg>
  ),
  countries: (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  ),
  flags: (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 21V4m0 0c5-2 9 2 14 0v10c-5 2-9-2-14 0" />
    </svg>
  ),
};

export function Home() {
  const today = dateKey();
  const daily = useStore((s) => s.daily);
  const level = useStore((s) => s.settings.level);
  const bests = useStore((s) => s.speedBests);
  const done = daily[today];
  const current = streak(daily, today);

  return (
    <div className="space-y-10">
      <section className="animate-rise">
        <Card className="relative overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-10 size-56 rounded-full bg-gold/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 size-56 rounded-full bg-violet-brand/25 blur-3xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-violet-brand dark:text-violet-300">
                Daily Challenge · #{dailyNumber(today)}
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                {done ? `You scored ${done.grid.filter(Boolean).length}/${DAILY_LENGTH} today.` : "Ten questions. One attempt."}
              </h1>
              <p className="mt-2 max-w-md text-slate-600 dark:text-slate-300">
                {done
                  ? `Finished in ${formatDuration(done.durationMs)}. A new map unfolds at midnight.`
                  : "The same puzzle for everyone, generated from today’s date. It gets harder as it goes."}
              </p>
              {done && (
                <div className="mt-3 flex gap-1" aria-label="Your answers">
                  {done.grid.map((ok, i) => (
                    <span key={i} className={`size-4 rounded-[4px] ${ok ? "bg-emerald-500" : "bg-rose-500"}`} />
                  ))}
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold tabular-nums">{current}</div>
                <div className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">day streak</div>
              </div>
              <LinkButton to="/daily" variant={done ? "ghost" : "gold"}>
                {done ? "View result" : "Play today"}
              </LinkButton>
            </div>
          </div>
        </Card>
      </section>

      <section className="animate-rise [animation-delay:80ms]">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Practice</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{LEVELS[level].blurb}</p>
          </div>
          <Segmented label="Difficulty" value={level} options={LEVEL_ORDER.map((l) => LEVELS[l])} onChange={(l) => updateSettings({ level: l })} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {KIND_ORDER.map((k) => (
            <Link key={k} to={`/play/${k}/${level}`} className="group">
              <Card className="flex h-full items-center gap-4 p-4 transition group-hover:-translate-y-0.5 group-hover:border-violet-brand/40 group-hover:shadow-lg sm:block sm:p-5">
                <div className="flex size-11 shrink-0 sm:mb-4 items-center justify-center rounded-xl bg-violet-brand/10 text-violet-brand dark:bg-violet-400/15 dark:text-violet-300">
                  {ICONS[k]}
                </div>
                <div>
                  <div className="font-bold">{KINDS[k].name}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{KINDS[k].blurb}</div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="animate-rise [animation-delay:160ms]">
        <div className="mb-4">
          <h2 className="text-xl font-bold tracking-tight">Speed Run</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Twenty questions against the clock. Each miss adds five seconds.</p>
        </div>
        <Card className="divide-y divide-black/5 dark:divide-white/5">
          {KIND_ORDER.map((k) => (
            <Link key={k} to={`/speed/${k}`} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-violet-brand/[.04]">
              <div className="flex items-center gap-3">
                <span className="text-violet-brand dark:text-violet-300">{ICONS[k]}</span>
                <span className="font-semibold">{KINDS[k].name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-500 dark:text-slate-400">
                  Best <span className="font-semibold tabular-nums text-ink dark:text-white">{bests[k] ? formatDuration(bests[k]) : "—"}</span>
                </span>
                <span aria-hidden className="text-slate-400">→</span>
              </div>
            </Link>
          ))}
        </Card>
      </section>

      <section className="flex items-center justify-center gap-3 pt-2 opacity-80" aria-hidden="true">
        {["jp", "br", "ke", "is", "np", "ca", "bt"].map((c, i) => (
          <Flag key={c} code={c} className={`w-10 shadow-sm ${i % 2 ? "rotate-3" : "-rotate-3"}`} />
        ))}
      </section>
    </div>
  );
}
