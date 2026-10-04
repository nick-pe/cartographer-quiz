// Port of Views/HomeView.swift + DailyChallengeBanner + CategoryCardView.
import { useState } from "react";
import { Link } from "react-router";
import { ShareButton } from "../components/Results";
import { Segmented } from "../components/ui";
import { DAILY_LENGTH, dailyNumber, emojiGrid, shareText } from "../lib/engine/daily";
import { dateKey } from "../lib/engine/dates";
import { DIFFICULTIES, TIERS } from "../lib/engine/difficulty";
import { DAILY_QUIZ, HOME_SECTIONS, gradientCss, type QuizDef, type QuizSection } from "../lib/engine/quizzes";
import { formatSpeed } from "../lib/engine/speedRun";
import { updateSettings, useStore, useStreaks } from "../lib/store";
import { useTitle } from "../lib/useTitle";

export function Home() {
  useTitle();
  const difficulty = useStore((s) => s.settings.difficulty);
  const { current } = useStreaks();

  return (
    <div className="mx-auto max-w-[860px] space-y-7">
      <header className="flex flex-col items-center gap-2 pt-2 text-center">
        <h1 className="text-[36px] font-bold leading-tight">Cartographer</h1>
        <p className="text-[15px] text-fg-2">Test your geography knowledge</p>
        {current > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-flame/15 px-3 py-1 text-[13px] font-semibold text-flame">
            <span aria-hidden="true">🔥</span>
            {current} day streak
          </div>
        )}
        <Segmented
          label="Difficulty"
          className="mt-2 w-full max-w-md"
          value={difficulty}
          options={DIFFICULTIES.map((d) => ({ id: d, name: TIERS[d].title }))}
          onChange={(d) => updateSettings({ difficulty: d })}
        />
        <p className="text-xs font-medium transition-colors" style={{ color: TIERS[difficulty].accent }}>
          {TIERS[difficulty].blurb}
        </p>
      </header>

      <DailyBanner streak={current} />

      {HOME_SECTIONS.map((s) => (
        <Section key={s.id} section={s} />
      ))}
    </div>
  );
}

function DailyBanner({ streak }: { streak: number }) {
  const today = dateKey();
  const result = useStore((s) => s.daily[today]);
  const score = result?.grid.filter(Boolean).length ?? 0;

  return (
    <section
      className="space-y-3.5 rounded-card border border-white/18 p-4 text-white shadow-[0_4px_20px_rgb(0_0_0/.3)]"
      style={{ background: gradientCss(DAILY_QUIZ.gradient) }}
      aria-label="Daily Challenge"
    >
      <div className="flex items-center gap-2">
        <span className="text-[22px]" aria-hidden="true">📅</span>
        <div>
          <div className="text-xs font-black tracking-[.1em]">DAILY CHALLENGE</div>
          <div className="text-xs font-medium text-white/75">#{dailyNumber(today)} · same quiz for everyone</div>
        </div>
      </div>
      {result ? (
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-[34px] font-bold leading-none">
              {score}/{result.grid.length}
            </span>
            <span className="text-[13px] font-medium text-white/70">today</span>
          </div>
          <div className="text-lg leading-none" aria-label={`${score} of ${result.grid.length} correct`}>
            {emojiGrid(result.grid)}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <ShareButton text={shareText(today, result.grid, streak)} className="!bg-white/92 !py-2 !text-sm !text-black/80" />
            <Link to="/daily" className="text-xs font-semibold text-white/85 underline-offset-2 hover:underline">
              Review answers
            </Link>
            <span className="text-xs font-medium text-white/75">Next quiz tomorrow</span>
          </div>
        </div>
      ) : (
        <Link
          to="/daily?start=1"
          className="flex w-full items-center justify-center gap-1.5 rounded-full bg-white/92 py-3 text-[15px] font-bold text-black/80 transition hover:bg-white active:scale-[.98]"
        >
          ▶ Play today’s {DAILY_LENGTH} questions
        </Link>
      )}
    </section>
  );
}

function Section({ section }: { section: QuizSection }) {
  const [open, setOpen] = useState(true);
  return (
    <section className="space-y-3">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex min-h-11 w-full items-center gap-2.5 text-left">
        <h2 className="text-xl font-bold">{section.title}</h2>
        <span className="rounded-full bg-fg/12 px-2 py-0.5 text-[13px] font-bold text-fg-2">{section.quizzes.length}</span>
        <span className="flex-1" />
        <svg viewBox="0 0 24 24" className={`size-4 text-fg-2 transition-transform ${open ? "" : "-rotate-90"}`} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="grid animate-rise grid-cols-2 gap-4 lg:grid-cols-4">
          {section.quizzes.map((q) => (
            <Tile key={q.id} quiz={q} />
          ))}
        </div>
      )}
    </section>
  );
}

function Tile({ quiz }: { quiz: QuizDef }) {
  const difficulty = useStore((s) => s.settings.difficulty);
  const best = useStore((s) => (quiz.isSpeedRun ? s.speedBests[difficulty]?.ms : undefined));
  return (
    <Link
      to={`/quiz/${quiz.slug}`}
      className="flex h-[140px] flex-col items-center justify-center gap-3 rounded-card border border-white/15 px-2 text-center text-white shadow-[0_4px_16px_rgb(0_0_0/.3)] transition hover:-translate-y-0.5 hover:brightness-110 active:scale-95"
      style={{ background: gradientCss(quiz.gradient) }}
    >
      <span className="text-[40px] leading-none drop-shadow-[0_1px_2px_rgb(0_0_0/.25)]" aria-hidden="true">
        {quiz.emoji}
      </span>
      <span className="space-y-1">
        <span className="line-clamp-2 block text-sm font-semibold leading-tight">{quiz.title}</span>
        <span className="block text-[11px] font-medium text-white/70">{best ? `Best ${formatSpeed(best)}` : quiz.subtitle}</span>
      </span>
    </Link>
  );
}
