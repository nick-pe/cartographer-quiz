import { useCallback, useEffect, useRef, useState } from "react";
import type { Question } from "../lib/quiz";
import { formatDuration } from "../lib/daily";
import { Flag } from "./Flag";

export interface Answer {
  question: Question;
  /** null when the clock ran out. */
  picked: string | null;
  correct: boolean;
  ms: number;
}

interface Props {
  questions: Question[];
  title: string;
  /** Per-question countdown in seconds, or null for untimed. */
  seconds: number | null;
  /** Show a running stopwatch (Speed Run), with this penalty per miss. */
  stopwatchPenaltyMs?: number;
  /** Shorter pauses between questions. */
  fast?: boolean;
  onFinish: (answers: Answer[], totalMs: number) => void;
}

export function QuizRunner({ questions, title, seconds, stopwatchPenaltyMs, fast, onFinish }: Props) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null | undefined>(undefined);
  const answers = useRef<Answer[]>([]);
  const started = useRef(performance.now());
  const questionStarted = useRef(performance.now());
  const advanceTimer = useRef<number | undefined>(undefined);

  const q = questions[index];
  const answered = picked !== undefined;

  const advance = useCallback(() => {
    window.clearTimeout(advanceTimer.current);
    if (index + 1 >= questions.length) {
      onFinish(answers.current, performance.now() - started.current);
    } else {
      setIndex(index + 1);
      setPicked(undefined);
      questionStarted.current = performance.now();
    }
  }, [index, questions.length, onFinish]);

  const choose = useCallback(
    (option: string | null) => {
      if (answered) return;
      const correct = option === q.answer;
      answers.current = [...answers.current, { question: q, picked: option, correct, ms: performance.now() - questionStarted.current }];
      setPicked(option);
      const pause = fast ? (correct ? 300 : 900) : correct ? 900 : 1800;
      advanceTimer.current = window.setTimeout(advance, pause);
    },
    [answered, q, fast, advance],
  );

  // Per-question countdown.
  useEffect(() => {
    if (seconds === null || answered) return;
    const t = window.setTimeout(() => choose(null), seconds * 1000);
    return () => window.clearTimeout(t);
  }, [seconds, answered, choose, index]);

  // Keyboard: 1–6 to answer, Enter/Space to move on.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (!answered && n >= 1 && n <= q.options.length) choose(q.options[n - 1]);
      else if (answered && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answered, q, choose, advance]);

  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  const misses = answers.current.filter((a) => !a.correct).length;

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-5 flex items-center justify-between text-sm font-medium text-slate-500 dark:text-slate-400">
        <span>{title}</span>
        <span className="tabular-nums">
          {stopwatchPenaltyMs !== undefined && <Stopwatch start={started.current} penalty={misses * stopwatchPenaltyMs} />}
          {stopwatchPenaltyMs === undefined && `${index + 1} / ${questions.length}`}
        </span>
      </div>

      <div className="mb-6 flex gap-1" aria-hidden="true">
        {questions.map((_, i) => {
          const a = answers.current[i];
          const color = a ? (a.correct ? "bg-emerald-500" : "bg-rose-500") : i === index ? "bg-violet-brand" : "bg-black/10 dark:bg-white/10";
          return <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${color}`} />;
        })}
      </div>

      <div key={index} className="animate-rise">
        {q.flag && (
          <div className="mb-6 flex justify-center">
            <Flag code={q.flag} className="w-64 sm:w-80" />
          </div>
        )}
        <h1 className="mb-2 text-center text-2xl font-bold tracking-tight text-balance sm:text-3xl">{q.prompt}</h1>
        <div className="mb-6 h-6 text-center text-sm text-slate-500 dark:text-slate-400">
          {answered && (picked === null ? <span className="text-rose-500">Out of time — it’s {q.answer}.</span> : q.subject.subregion)}
        </div>

        {seconds !== null && (
          <div className="mb-6 h-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <div
              key={index}
              className="h-full origin-left rounded-full bg-gold"
              style={{ animation: `drain ${seconds}s linear forwards`, animationPlayState: answered ? "paused" : "running" }}
            />
          </div>
        )}

        <div className={`grid gap-3 ${q.options.length > 4 ? "sm:grid-cols-2" : ""}`}>
          {q.options.map((option, i) => {
            const isAnswer = option === q.answer;
            const isPicked = option === picked;
            let style = "border-black/[.07] bg-white hover:border-violet-brand/50 hover:bg-violet-brand/[.04] dark:border-night-line dark:bg-night-2 dark:hover:border-violet-400/50";
            if (answered && isAnswer) style = "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 animate-pop";
            else if (answered && isPicked) style = "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 animate-shake";
            else if (answered) style = "border-black/[.05] bg-white/60 opacity-60 dark:border-night-line dark:bg-night-2/60";
            return (
              <button
                key={option}
                disabled={answered}
                onClick={() => choose(option)}
                className={`group flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left text-[16px] font-semibold transition ${style}`}
              >
                <kbd className="hidden size-6 shrink-0 items-center justify-center rounded-md bg-black/5 text-xs font-medium text-slate-500 sm:flex dark:bg-white/8 dark:text-slate-400">
                  {i + 1}
                </kbd>
                <span>{option}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 h-11 text-center">
          {answered && (
            <button onClick={advance} className="text-sm font-semibold text-violet-brand hover:underline dark:text-violet-300">
              {index + 1 >= questions.length ? "See results" : "Next"} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Stopwatch({ start, penalty }: { start: number; penalty: number }) {
  const [now, setNow] = useState(performance.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(performance.now()), 100);
    return () => window.clearInterval(t);
  }, []);
  return (
    <span>
      {formatDuration(now - start + penalty)}
      {penalty > 0 && <span className="ml-1.5 text-rose-500">+{penalty / 1000}s</span>}
    </span>
  );
}
