import type { Answer } from "./QuizRunner";
import { Flag } from "./Flag";

/** Every question, with what you picked and the right answer. */
export function Review({ answers }: { answers: Answer[] }) {
  return (
    <ol className="divide-y divide-black/5 dark:divide-white/5">
      {answers.map((a, i) => (
        <li key={i} className="flex items-center gap-3 py-3">
          <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${a.correct ? "bg-emerald-500" : "bg-rose-500"}`}>
            {a.correct ? "✓" : "✕"}
          </span>
          {a.question.flag && <Flag code={a.question.flag} className="w-10 rounded shadow-none" />}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm text-slate-500 dark:text-slate-400">{a.question.prompt}</div>
            <div className="font-semibold">
              {a.question.answer}
              {!a.correct && (
                <span className="ml-2 font-normal text-rose-500 line-through decoration-1">{a.picked ?? "no answer"}</span>
              )}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function ScoreRing({ score, total }: { score: number; total: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = total ? score / total : 0;
  return (
    <div className="relative size-36">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-black/8 dark:stroke-white/10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          stroke="url(#ring)"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.2,.8,.2,1)" }}
        />
        <defs>
          <linearGradient id="ring" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#7c6ae6" />
            <stop offset="1" stopColor="#ffb829" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tracking-tight tabular-nums">{score}</span>
        <span className="text-sm text-slate-500 dark:text-slate-400">of {total}</span>
      </div>
    </div>
  );
}

export function verdict(score: number, total: number): string {
  const pct = score / total;
  if (pct === 1) return "Flawless. The map is yours.";
  if (pct >= 0.8) return "Expert navigation.";
  if (pct >= 0.6) return "Solid bearings.";
  if (pct >= 0.4) return "Some uncharted territory.";
  return "Here be dragons. Try again?";
}
