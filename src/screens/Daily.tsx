import { useEffect, useMemo, useState } from "react";
import { QuizRunner, type Answer } from "../components/QuizRunner";
import { Review, ScoreRing, verdict } from "../components/Review";
import { Button, Card, LinkButton } from "../components/ui";
import { DAILY_LENGTH, dailyNumber, dailyQuiz, dateKey, formatDuration, shareText } from "../lib/daily";
import { share } from "../lib/share";
import { recordDaily, recordResult, streak, useStore } from "../lib/store";

export function Daily() {
  const [today] = useState(dateKey);
  const questions = useMemo(() => dailyQuiz(today), [today]);
  const result = useStore((s) => s.daily[today]);
  const [playing, setPlaying] = useState(false);

  if (result && !playing) return <DailyResult today={today} />;

  if (playing && !result) {
    return (
      <QuizRunner
        title={`Daily Challenge #${dailyNumber(today)}`}
        questions={questions}
        seconds={null}
        onFinish={(answers: Answer[], ms) => {
          const grid = answers.map((a) => a.correct);
          recordDaily(today, { grid, picks: answers.map((a) => a.picked), durationMs: ms });
          recordResult({ quiz: "Daily Challenge", level: null, score: grid.filter(Boolean).length, total: grid.length, durationMs: ms });
          setPlaying(false);
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-xl animate-rise">
      <Card className="p-8 text-center">
        <div className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-violet-brand dark:text-violet-300">Daily Challenge · #{dailyNumber(today)}</div>
        <h1 className="text-3xl font-bold tracking-tight">Ready, cartographer?</h1>
        <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-slate-600 dark:text-slate-300">
          <li className="flex gap-3"><span className="text-gold">◆</span>{DAILY_LENGTH} questions mixing capitals, countries and flags.</li>
          <li className="flex gap-3"><span className="text-gold">◆</span>Starts easy, ends on Cartographer difficulty.</li>
          <li className="flex gap-3"><span className="text-gold">◆</span>No clock — but you only get one attempt.</li>
        </ul>
        <Button variant="gold" className="mt-8 w-full sm:w-auto" onClick={() => setPlaying(true)}>
          Start today’s challenge
        </Button>
      </Card>
    </div>
  );
}

function DailyResult({ today }: { today: string }) {
  const result = useStore((s) => s.daily[today])!;
  const daily = useStore((s) => s.daily);
  const [status, setStatus] = useState<string | null>(null);
  const questions = useMemo(() => dailyQuiz(today), [today]);
  const score = result.grid.filter(Boolean).length;
  const answers: Answer[] = questions.map((question, i) => ({
    question,
    picked: result.picks?.[i] ?? null,
    correct: result.grid[i],
    ms: 0,
  }));

  return (
    <div className="mx-auto max-w-xl animate-rise space-y-6">
      <Card className="flex flex-col items-center p-8 text-center">
        <div className="mb-4 text-xs font-bold uppercase tracking-[.18em] text-violet-brand dark:text-violet-300">Daily Challenge · #{dailyNumber(today)}</div>
        <ScoreRing score={score} total={result.grid.length} />
        <h1 className="mt-5 text-2xl font-bold tracking-tight">{verdict(score, result.grid.length)}</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {formatDuration(result.durationMs)} · {streak(daily, today)} day streak
        </p>
        <div className="mt-5 flex gap-1.5" aria-label={`${score} of ${result.grid.length} correct`}>
          {result.grid.map((ok, i) => (
            <span key={i} className={`size-6 rounded-md ${ok ? "bg-emerald-500" : "bg-rose-500"}`} />
          ))}
        </div>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button
            variant="gold"
            onClick={async () => {
              const r = await share(shareText(today, result.grid, result.durationMs));
              setStatus(r === "copied" ? "Copied to clipboard" : r === "failed" ? "Couldn’t share" : null);
            }}
          >
            Share result
          </Button>
          <LinkButton to="/" variant="ghost">
            Home
          </LinkButton>
        </div>
        <div className="mt-3 h-5 text-sm text-emerald-600 dark:text-emerald-400" role="status">
          {status}
        </div>
        <NextIn />
      </Card>
      <Card className="px-5 py-2">
        <Review answers={answers} />
      </Card>
    </div>
  );
}

function NextIn() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const s = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
  const hh = Math.floor(s / 3600);
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return (
    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
      Next challenge in <span className="font-semibold tabular-nums text-ink dark:text-white">{`${hh}:${mm}:${ss}`}</span>
    </p>
  );
}
