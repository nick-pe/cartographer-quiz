import { useEffect, useState } from "react";
import { Flag } from "./Flag";
import type { Answer } from "./QuizRunner";

/** Every question, with what you picked and the right answer. (Web only: the app has no review.) */
export function Review({ answers }: { answers: Answer[] }) {
  return (
    <ol className="divide-y divide-surface-line">
      {answers.map((a, i) => {
        const flag = a.question.flag ?? a.question.optionFlags?.[a.question.answer];
        return (
          <li key={i} className="flex items-center gap-3 py-3">
            <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${a.correct ? "bg-correct" : "bg-wrong"}`}>
              {a.correct ? "✓" : "✕"}
            </span>
            {flag && <Flag code={flag} className="w-10 rounded shadow-none" />}
            <div className="min-w-0 flex-1">
              <div className="text-sm text-fg-2">{a.question.text}</div>
              <div className="font-semibold">
                {a.question.answer}
                {!a.correct && <span className="ml-2 font-normal text-wrong line-through decoration-1">{a.picked ?? "no answer"}</span>}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** The app's results ring: green arc, "x/n" and the percentage. */
export function ScoreRing({ score, total }: { score: number; total: number }) {
  const r = 66;
  const c = 2 * Math.PI * r;
  const pct = total ? score / total : 0;
  // Starts empty and fills, like the app.
  const [shown, setShown] = useState(0);
  useEffect(() => setShown(pct), [pct]);
  return (
    <div className="relative size-[140px]" role="img" aria-label={`Scored ${score} out of ${total}, ${Math.round(pct * 100)} percent`}>
      <svg viewBox="0 0 140 140" className="size-full -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" strokeWidth="8" className="stroke-answer-line" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className="stroke-correct"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown)}
          style={{ transition: "stroke-dashoffset 1s ease-out 500ms" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[32px] font-bold tabular-nums">
          {score}/{total}
        </span>
        <span className="font-medium text-fg-2">{Math.floor(pct * 100)}%</span>
      </div>
    </div>
  );
}

/** QuizResult.stars / message from the app. */
export function stars(score: number, total: number): 1 | 2 | 3 {
  const pct = total ? (score / total) * 100 : 0;
  return pct >= 80 ? 3 : pct >= 50 ? 2 : 1;
}

export const MESSAGES = { 3: "Outstanding!", 2: "Well done!", 1: "Keep practicing!" } as const;
