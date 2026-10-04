import { Card, LinkButton } from "../components/ui";
import { formatDuration } from "../lib/daily";
import { LEVELS } from "../lib/levels";
import { bestStreak, streak, useStore } from "../lib/store";

export function History() {
  const history = useStore((s) => s.history);
  const daily = useStore((s) => s.daily);
  const recording = useStore((s) => s.settings.recordHistory);

  const played = history.length;
  const correct = history.reduce((n, h) => n + h.score, 0);
  const asked = history.reduce((n, h) => n + h.total, 0);

  const stats = [
    { label: "Current streak", value: streak(daily) },
    { label: "Best streak", value: bestStreak(daily) },
    { label: "Quizzes played", value: played },
    { label: "Accuracy", value: asked ? `${Math.round((correct / asked) * 100)}%` : "—" },
  ];

  return (
    <div className="animate-rise space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">History</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className="text-2xl font-bold tabular-nums">{s.value}</div>
            <div className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{s.label}</div>
          </Card>
        ))}
      </div>

      {!recording && (
        <p className="rounded-xl bg-gold/15 px-4 py-3 text-sm text-[#7a5500] dark:text-gold">
          Recording is off, so new results aren’t being saved. Turn it back on in Settings.
        </p>
      )}

      {history.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-slate-500 dark:text-slate-400">No quizzes yet. Your results will appear here.</p>
          <LinkButton to="/" className="mt-5">
            Start playing
          </LinkButton>
        </Card>
      ) : (
        <Card className="divide-y divide-black/5 dark:divide-white/5">
          {history.map((h) => (
            <div key={h.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <div className="min-w-0">
                <div className="truncate font-semibold">{h.quiz}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {new Date(h.at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  {h.level && ` · ${LEVELS[h.level].name}`} · {formatDuration(h.durationMs)}
                </div>
              </div>
              <div className="shrink-0 text-right text-lg font-bold tabular-nums">
                {h.score}
                <span className="text-sm font-medium text-slate-400">/{h.total}</span>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
