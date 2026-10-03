import { useMemo, useState } from "react";
import { Navigate, useParams } from "react-router";
import { QuizRunner, type Answer } from "../components/QuizRunner";
import { Review } from "../components/Review";
import { Button, Card, LinkButton } from "../components/ui";
import { formatDuration } from "../lib/daily";
import { KINDS, type QuizKind } from "../lib/levels";
import { SPEED_LENGTH, SPEED_PENALTY_MS, speedRun } from "../lib/speedrun";
import { recordResult, recordSpeedRun, useStore } from "../lib/store";

export function SpeedRun() {
  const { kind } = useParams();
  if (!kind || !(kind in KINDS)) return <Navigate to="/" replace />;
  return <Run key={kind} kind={kind as QuizKind} />;
}

type Phase = { name: "ready" } | { name: "playing"; round: number } | { name: "done"; answers: Answer[]; ms: number; best: boolean };

function Run({ kind }: { kind: QuizKind }) {
  const [phase, setPhase] = useState<Phase>({ name: "ready" });
  const [round, setRound] = useState(0);
  const best = useStore((s) => s.speedBests[kind]);
  const questions = useMemo(() => speedRun(kind, Date.now() + round), [kind, round]);
  const title = `Speed Run · ${KINDS[kind].name}`;

  const start = () => {
    setRound((r) => r + 1);
    setPhase({ name: "playing", round: round + 1 });
  };

  if (phase.name === "playing") {
    return (
      <QuizRunner
        key={phase.round}
        title={title}
        questions={questions}
        seconds={null}
        stopwatchPenaltyMs={SPEED_PENALTY_MS}
        fast
        onFinish={(answers, ms) => {
          const misses = answers.filter((a) => !a.correct).length;
          const total = ms + misses * SPEED_PENALTY_MS;
          const isBest = recordSpeedRun(kind, total);
          recordResult({ quiz: `Speed Run · ${KINDS[kind].name}`, level: null, score: answers.length - misses, total: answers.length, durationMs: total });
          setPhase({ name: "done", answers, ms: total, best: isBest });
        }}
      />
    );
  }

  if (phase.name === "done") {
    const misses = phase.answers.filter((a) => !a.correct).length;
    return (
      <div className="mx-auto max-w-xl animate-rise space-y-6">
        <Card className="p-8 text-center">
          <div className="mb-3 text-sm font-medium text-slate-500 dark:text-slate-400">{title}</div>
          {phase.best && <div className="mb-2 inline-block rounded-full bg-gold/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#a97400] dark:text-gold">New best</div>}
          <div className="text-6xl font-bold tracking-tight tabular-nums">{formatDuration(phase.ms)}</div>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            {phase.answers.length - misses}/{phase.answers.length} correct
            {misses > 0 && ` · includes +${(misses * SPEED_PENALTY_MS) / 1000}s in penalties`}
          </p>
          {best !== undefined && !phase.best && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Best: {formatDuration(best)}</p>}
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={start}>Run again</Button>
            <LinkButton to="/" variant="ghost">Home</LinkButton>
          </div>
        </Card>
        <Card className="px-5 py-2">
          <Review answers={phase.answers} />
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl animate-rise">
      <Card className="p-8 text-center">
        <div className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-violet-brand dark:text-violet-300">Speed Run</div>
        <h1 className="text-3xl font-bold tracking-tight">{KINDS[kind].name}</h1>
        <p className="mx-auto mt-3 max-w-sm text-slate-600 dark:text-slate-300">
          {SPEED_LENGTH} questions, four options each. The clock runs from the first question; every miss adds {SPEED_PENALTY_MS / 1000} seconds.
        </p>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Your best: <span className="font-semibold tabular-nums text-ink dark:text-white">{best !== undefined ? formatDuration(best) : "—"}</span>
        </p>
        <Button variant="gold" className="mt-7" onClick={start}>
          Go
        </Button>
        <p className="mt-4 hidden text-xs text-slate-400 sm:block">Tip: press 1–4 to answer.</p>
      </Card>
    </div>
  );
}
