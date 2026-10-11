// Port of Views/StatsView.swift: a range picker over a column of cards.
import { useMemo, useState, type ReactNode } from "react";
import { AccuracyChart, SeriesTable, VolumeChart } from "../components/Charts";
import { ShareButton } from "../components/Results";
import { LinkButton, Segmented } from "../components/ui";
import { addDays, dateKey } from "../lib/engine/dates";
import { DIFFICULTIES, TIERS } from "../lib/engine/difficulty";
import { formatSpeed } from "../lib/engine/speedRun";
import { RANGES, byDifficulty, dailySeries, inRange, overview, standings, streaks, type Range } from "../lib/engine/stats";
import { useStore } from "../lib/store";
import { SITE_URL } from "../lib/site";
import { useTitle } from "../lib/useTitle";
import { useI18n } from "../i18n";

const GREEN = "rgb(38 179 89)";
const BLUE = "rgb(77 128 242)";

export function Trends() {
  const i18n = useI18n();
  const { t } = i18n;
  useTitle(t.trends.title);
  const attempts = useStore((s) => s.attempts);
  const recording = useStore((s) => s.settings.recordHistory);
  const bests = useStore((s) => s.speedBests);
  const daily = useStore((s) => s.daily);
  const [range, setRange] = useState<Range>("W");
  const r = RANGES.find((x) => x.id === range)!;

  const all = useMemo(() => overview(attempts), [attempts]);
  const windowed = useMemo(() => inRange(attempts, r.days), [attempts, r.days]);
  const series = useMemo(() => dailySeries(windowed, r.days), [windowed, r.days]);
  // Daily days count too: they're kept even when recording is off.
  const days = useMemo(() => new Set([...attempts.map((a) => a.dayKey), ...Object.keys(daily)]), [attempts, daily]);
  const streak = streaks(days);

  if (!attempts.length) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <svg viewBox="0 0 24 24" className="size-11 text-fg-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M3 3v18h18M7 15l4-5 3 3 6-7" />
        </svg>
        <h1 className="text-xl font-bold">{t.trends.emptyTitle}</h1>
        <p className="text-fg-2">{t.trends.emptyBody}</p>
        {!recording && <p className="text-sm text-gold">{t.trends.recordingOffShort}</p>}
        <LinkButton to="/" className="mt-3">{t.trends.playQuiz}</LinkButton>
      </div>
    );
  }

  const stats = overview(windowed);
  const tiers = byDifficulty(windowed);
  const ranked = standings(windowed);
  const activePoints = series.filter((p) => p.quizzes > 0);

  return (
    <div className="mx-auto max-w-[620px] space-y-4">
      <h1 className="sr-only">{t.trends.title}</h1>
      <Segmented label={t.trends.range} value={range} options={RANGES.map((x) => ({ id: x.id, name: t.trends.ranges[x.id] }))} onChange={setRange} />

      {!recording && (
        <div className="flex items-center gap-2 rounded-[10px] bg-gold/12 p-3 text-xs font-medium text-gold">
          <span aria-hidden="true">⏸</span> {t.trends.recordingOff}
        </div>
      )}

      <StatCard title={t.trends.overview} icon="📊" tint={BLUE}>
        <Metrics
          items={[
            [i18n.number(stats.quizzes), t.trends.quizzes],
            [i18n.number(Math.floor(stats.accuracy) / 100, { style: "percent" }), t.trends.accuracy],
            [i18n.number(stats.questions), t.trends.questions],
          ]}
        />
      </StatCard>

      <StatCard title={t.trends.streak} icon="🔥" tint="rgb(255 115 51)">
        <Metrics items={[[streak.current, t.trends.days(streak.current)], [streak.longest, t.trends.longest]]} />
        <div className="mt-3.5 flex gap-[5px]" role="img" aria-label={t.trends.activeDays}>
          {Array.from({ length: 14 }, (_, i) => addDays(dateKey(), i - 13)).map((d) => (
            <span key={d} title={d} className={`h-3.5 flex-1 rounded-full ${days.has(d) ? "bg-flame" : "bg-answer-line"}`} />
          ))}
        </div>
        {streak.current > 0 && (
          <div className="mt-3.5">
            <ShareButton
              label={t.trends.shareStreak}
              text={`${t.share.streakCard(streak.current, streak.longest, Math.floor(all.accuracy), all.quizzes)}\n\n${t.share.invite}\n${SITE_URL}${i18n.code === "en" ? "" : i18n.path("/")}`}
            />
          </div>
        )}
      </StatCard>

      <StatCard title={t.trends.speedBests} icon="⚡" tint="rgb(255 204 51)">
        {Object.keys(bests).length === 0 ? (
          <Muted>{t.trends.speedEmpty}</Muted>
        ) : (
          <div className="space-y-2.5">
            {DIFFICULTIES.map((d) => (
              <div key={d} className="flex items-center gap-2 text-sm">
                <span aria-hidden="true" className="text-xs">{TIERS[d].icon}</span>
                <span className="flex-1 font-medium">{t.tiers[d].title}</span>
                <span className={`text-[15px] font-bold tabular-nums ${bests[d] ? "text-gold" : "text-fg-3"}`}>{bests[d] ? formatSpeed(bests[d].ms) : "—"}</span>
              </div>
            ))}
          </div>
        )}
      </StatCard>

      <StatCard title={t.trends.accuracy} icon="🎯" tint={GREEN}>
        {activePoints.length < 2 ? <NotEnough /> : (
          <>
            <AccuracyChart points={series} color={GREEN} />
            <SeriesTable points={series} />
          </>
        )}
      </StatCard>

      <StatCard title={t.trends.perDay} icon="📅" tint={BLUE}>
        {activePoints.length === 0 ? <NotEnough /> : <VolumeChart points={series} color={BLUE} />}
      </StatCard>

      <StatCard title={t.trends.byDifficulty(t.trends.rangeLabels[range])} icon="📶" tint="rgb(255 204 51)">
        {tiers.length === 0 ? <NotEnough /> : (
          <div className="space-y-3">
            {tiers.map((row) => (
              <div key={row.difficulty} className="grid grid-cols-[6.5rem_1fr] items-center gap-3 text-sm">
                <span className="font-medium">{t.tiers[row.difficulty].title}</span>
                <div className="flex items-center gap-2">
                  <div className="h-6 rounded-r-[4px]" style={{ width: `${Math.max(2, row.accuracy * 0.7)}%`, background: TIERS[row.difficulty].accent }} />
                  {/* The round count matters: one lucky round at 100% looks like twenty steady ones without it. */}
                  <span className="whitespace-nowrap text-[11px] font-semibold text-fg-2">
                    {i18n.number(Math.floor(row.accuracy) / 100, { style: "percent" })} · {t.trends.rounds(row.rounds)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </StatCard>

      <StatCard title={t.trends.highlights} icon="⭐" tint="rgb(255 204 51)">
        {ranked.strongest.length === 0 ? (
          <Muted>{t.trends.highlightsEmpty}</Muted>
        ) : (
          <div className="space-y-3">
            <Standing title={t.trends.strongest} rows={ranked.strongest} tint="text-correct" />
            {ranked.weakest[0]?.title !== ranked.strongest[0]?.title && <Standing title={t.trends.needsWork} rows={ranked.weakest} tint="text-wrong" />}
          </div>
        )}
      </StatCard>
    </div>
  );
}

function StatCard({ title, icon, tint, children }: { title: string; icon: string; tint: string; children: ReactNode }) {
  return (
    <section className="rounded-card border border-surface-line bg-surface p-4">
      <h2 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase" style={{ color: tint }}>
        <span aria-hidden="true">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Metrics({ items }: { items: [string | number, string][] }) {
  return (
    <div className="flex divide-x divide-answer-line">
      {items.map(([value, label]) => (
        <div key={label} className="flex flex-1 flex-col items-center gap-0.5">
          <span className="text-[30px] font-bold leading-tight">{value}</span>
          <span className="text-[10px] font-semibold uppercase text-fg-3">{label}</span>
        </div>
      ))}
    </div>
  );
}

function Standing({ title, rows, tint }: { title: string; rows: { title: string; quizId: string; accuracy: number }[]; tint: string }) {
  const i18n = useI18n();
  return (
    <div className="space-y-1.5">
      <h3 className="text-[10px] font-bold uppercase text-fg-3">{title}</h3>
      {rows.map((row) => (
        <div key={row.title} className="flex justify-between gap-3 text-[13px]">
          <span className="truncate font-medium">{i18n.quizTitle({ id: row.quizId, title: row.title })}</span>
          <span className={`font-bold ${tint}`}>{i18n.number(Math.floor(row.accuracy) / 100, { style: "percent" })}</span>
        </div>
      ))}
    </div>
  );
}

const Muted = ({ children }: { children: ReactNode }) => <p className="text-[13px] text-fg-3">{children}</p>;
const NotEnough = () => <Muted>{useI18n().t.trends.notEnough}</Muted>;
