// Port of QuizViewModel + QuizView/QuestionView: one question at a time, a
// per-question countdown on timed tiers, an automatic reveal pause, and a
// Speed Run clock that counts only time spent answering.
import { useCallback, useEffect, useRef, useState } from "react";
import { TIERS, type Difficulty } from "../lib/engine/difficulty";
import type { Question } from "../lib/engine/question";
import { PENALTY_PER_WRONG_MS, formatSpeed } from "../lib/engine/speedRun";
import { Flag } from "./Flag";
import { DifficultyChip } from "./ui";

export interface Answer {
  question: Question;
  /** null when the clock ran out. */
  picked: string | null;
  correct: boolean;
  /** Time spent on this question, excluding the reveal and any time the tab was hidden. */
  ms: number;
}

export interface RunResult {
  answers: Answer[];
  /** Wall-clock time from first question to last answer. */
  totalMs: number;
  /** Sum of per-question answering time: the Speed Run score before penalties. */
  answeringMs: number;
}

interface Props {
  questions: Question[];
  difficulty: Difficulty;
  /** Count-up clock instead of a per-question countdown, and a shorter reveal. */
  speedRun?: boolean;
  onFinish: (result: RunResult) => void;
}

/** A clock that only runs while the page is visible. */
function usePausableClock() {
  const accum = useRef(0);
  const since = useRef<number | null>(null);
  const elapsed = useCallback(() => accum.current + (since.current === null ? 0 : performance.now() - since.current), []);
  const stop = useCallback(() => {
    accum.current = elapsed();
    since.current = null;
  }, [elapsed]);
  const start = useCallback(() => {
    if (since.current === null && document.visibilityState === "visible") since.current = performance.now();
  }, []);
  const reset = useCallback(() => {
    accum.current = 0;
    since.current = null;
  }, []);
  return { elapsed, stop, start, reset };
}

export function QuizRunner({ questions, difficulty, speedRun = false, onFinish }: Props) {
  const [index, setIndex] = useState(0);
  // undefined while playing; the pick (or null for a timeout) while revealing.
  const [picked, setPicked] = useState<string | null | undefined>(undefined);
  const [, tick] = useState(0);
  const answers = useRef<Answer[]>([]);
  const startedAt = useRef(performance.now());
  const clock = usePausableClock();
  const revealTimer = useRef<number | undefined>(undefined);

  const q = questions[index];
  const answered = picked !== undefined;
  const seconds = speedRun ? null : TIERS[difficulty].seconds;

  const advance = useCallback(() => {
    window.clearTimeout(revealTimer.current);
    if (index + 1 >= questions.length) {
      const list = answers.current;
      onFinish({ answers: list, totalMs: performance.now() - startedAt.current, answeringMs: list.reduce((n, a) => n + a.ms, 0) });
    } else {
      setIndex(index + 1);
      setPicked(undefined);
    }
  }, [index, questions.length, onFinish]);

  const choose = useCallback(
    (option: string | null) => {
      if (answered) return;
      clock.stop();
      answers.current = [...answers.current, { question: q, picked: option, correct: option === q.answer, ms: clock.elapsed() }];
      setPicked(option);
      // Long enough to read the reveal, short enough not to drag; a race is faster still.
      revealTimer.current = window.setTimeout(advance, speedRun ? 400 : 800);
    },
    [answered, q, clock, advance, speedRun],
  );

  // Each question starts its own clock.
  useEffect(() => {
    clock.reset();
    clock.start();
  }, [index, clock]);

  // A hidden tab pauses the clock, like backgrounding the app: a phone call
  // shouldn't count as getting the question wrong.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") clock.stop();
      else if (!answered) clock.start();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [answered, clock]);

  // Redraw the countdown / stopwatch, and time out when the countdown ends.
  useEffect(() => {
    if (answered || (seconds === null && !speedRun)) return;
    const t = window.setInterval(() => {
      if (seconds !== null && clock.elapsed() >= seconds * 1000) choose(null);
      else tick((n) => n + 1);
    }, 100);
    return () => window.clearInterval(t);
  }, [answered, seconds, speedRun, clock, choose]);

  // Keyboard: 1–6 to answer, Enter/Space to skip the reveal.
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

  useEffect(() => () => window.clearTimeout(revealTimer.current), []);

  const score = answers.current.filter((a) => a.correct).length;
  const misses = answers.current.length - score;
  const remaining = seconds === null ? 0 : Math.max(0, seconds - clock.elapsed() / 1000);
  const flagOptions = !!q.optionFlags;
  const compact = q.options.length > 4;

  return (
    <div className="mx-auto flex max-w-[620px] flex-col gap-4">
      <div className="space-y-2">
        <div className="h-1 overflow-hidden rounded-full bg-track" role="progressbar" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={index}>
          <div className="h-full rounded-full bg-blue transition-[width] duration-300" style={{ width: `${(index / questions.length) * 100}%` }} />
        </div>
        <div className="flex items-center gap-2 text-[13px] font-medium text-fg-2">
          <span className="tabular-nums">
            {index + 1} / {questions.length}
          </span>
          <DifficultyChip difficulty={difficulty} />
          <span className="flex-1" />
          {speedRun && (
            <span className="flex items-center gap-1 font-bold text-gold tabular-nums">
              <span aria-hidden="true">⚡</span>
              {formatSpeed(answers.current.reduce((n, a) => n + a.ms, 0) + (answered ? 0 : clock.elapsed()))}
              {misses > 0 && <span className="text-wrong">+{(misses * PENALTY_PER_WRONG_MS) / 1000}s</span>}
            </span>
          )}
          <span className="tabular-nums">Score: {score}</span>
        </div>
      </div>

      {seconds !== null && (
        <div aria-live="off" aria-label={`${Math.ceil(remaining)} seconds remaining`}>
          <div
            className={`mb-1.5 flex items-center justify-center gap-1.5 text-3xl font-bold tabular-nums transition ${remaining <= 5 ? "scale-[1.06] text-wrong" : "text-blue"}`}
          >
            <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="13" r="8" />
              <path d="M12 9v4l2.5 2M9.5 2.5h5" />
            </svg>
            {Math.ceil(remaining)}s
          </div>
          <div className="h-[5px] overflow-hidden rounded-full bg-track">
            <div className={`h-full rounded-full ${remaining <= 5 ? "bg-wrong" : "bg-blue"}`} style={{ width: `${(remaining / seconds) * 100}%` }} />
          </div>
        </div>
      )}

      <div key={index} className="animate-slide space-y-5">
        {q.flag && (
          <div className="flex justify-center pt-1">
            <Flag code={q.flag} className="w-56 sm:w-72" />
          </div>
        )}
        <h1 className={`text-center font-bold text-balance ${compact ? "text-xl" : "text-[22px]"} sm:text-2xl`}>{q.text}</h1>
        <div className="h-5 text-center text-sm font-medium text-wrong" role="status">
          {answered && picked === null && `Out of time — it’s ${q.answer}.`}
        </div>

        <div className={flagOptions ? "grid grid-cols-2 gap-3 sm:grid-cols-3" : `flex flex-col ${compact ? "gap-2.5" : "gap-3"}`}>
          {q.options.map((option, i) => {
            const isAnswer = option === q.answer;
            const state = !answered ? "default" : isAnswer ? "correct" : option === picked ? "wrong" : "dimmed";
            const style = {
              default: "border-answer-line bg-answer text-fg hover:border-blue/70",
              correct: "border-correct bg-correct/25 text-correct animate-pop",
              wrong: "border-wrong bg-wrong/25 text-wrong animate-shake",
              dimmed: "border-answer-line/30 bg-answer/50 text-fg-3",
            }[state];
            return (
              <button
                key={option}
                disabled={answered}
                onClick={() => choose(option)}
                aria-label={flagOptions ? `Flag ${i + 1}` : undefined}
                className={`relative flex items-center justify-center rounded-button border-[1.5px] px-3 text-center font-medium transition duration-300 ${style} ${
                  flagOptions ? "p-2.5" : compact ? "min-h-[52px] py-2 text-[15px]" : "min-h-[62px] py-2.5 text-base"
                }`}
              >
                <kbd className="absolute left-3 top-1/2 hidden -translate-y-1/2 font-sans text-xs font-semibold text-fg-3 sm:block">{i + 1}</kbd>
                {flagOptions ? (
                  <Flag code={q.optionFlags![option]} className={`w-full shadow-none ${state === "dimmed" ? "opacity-40" : ""}`} />
                ) : (
                  <span className="px-5">{option}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
