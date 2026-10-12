// Port of Views/ResultsView.swift, plus the web's answer review.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { TIERS, type Difficulty } from "../lib/engine/difficulty";
import { PENALTY_PER_WRONG_MS, formatSpeed } from "../lib/engine/speedRun";
import { copy, share } from "../lib/share";
import type { Answer } from "./QuizRunner";
import { useI18n } from "../i18n";
import { Review, ScoreRing, stars } from "./Review";
import { Button, Card, DifficultyChip, LinkButton, LocalLink, Stars } from "./ui";

export interface SpeedOutcome {
  answeringMs: number;
  wrong: number;
  isBest: boolean;
  previous: number | null;
}

interface Props {
  title: string;
  difficulty: Difficulty;
  answers: Answer[];
  /** Shown above the actions (Speed Run time, Daily grid). */
  extra?: ReactNode;
  /** Text for "Share result"; omitted where a block in `extra` shares instead. */
  shareText?: string;
  onTryHarder?: (tier: Difficulty) => void;
  onPlayAgain?: () => void;
  /** Slug of the quiz's study list, linked under the title. */
  studySlug?: string | null;
}

export function Results({ title, difficulty, answers, extra, shareText, onTryHarder, onPlayAgain, studySlug }: Props) {
  const { t } = useI18n();
  const score = answers.filter((a) => a.correct).length;
  const total = answers.length;
  const starCount = stars(score, total);
  // Only nudge upward when there's clearly room to spare.
  const harder = score / total >= 0.8 ? TIERS[difficulty].next : null;

  return (
    <div className="mx-auto flex max-w-[620px] animate-rise flex-col items-center gap-7 text-center">
      <Stars count={starCount} />
      <h1 className="text-[28px] font-bold">{t.results.messages[starCount]}</h1>
      <ScoreRing score={score} total={total} />
      <div className="flex flex-col items-center gap-2.5">
        <div className="text-[15px] font-medium text-fg-2">{title}</div>
        <DifficultyChip difficulty={difficulty} />
        {studySlug && (
          <LocalLink to={`/learn/${studySlug}`} className="text-sm font-semibold text-blue underline-offset-2 hover:underline">
            📖 {t.learn.studyList}
          </LocalLink>
        )}
        {shareText && <ShareButton text={shareText} />}
      </div>

      {extra}

      <div className="flex w-full flex-col gap-3">
        {harder && onTryHarder && (
          <Button className="w-full" style={{ background: TIERS[harder].accent }} onClick={() => onTryHarder(harder)}>
            <span aria-hidden="true">{TIERS[harder].icon}</span> {t.results.tryTier(t.tiers[harder].title)} →
          </Button>
        )}
        {onPlayAgain && (
          <Button className="w-full" onClick={onPlayAgain}>
            {t.results.playAgain}
          </Button>
        )}
        <LinkButton to="/" variant="violet" className="w-full">
          {t.results.backHome}
        </LinkButton>
      </div>

      <Card className="w-full px-5 py-2 text-left">
        <h2 className="pt-3 text-xs font-bold uppercase tracking-wider text-fg-3">{t.results.yourAnswers}</h2>
        <Review answers={answers} />
      </Card>
    </div>
  );
}

export function SpeedRunBlock({ outcome }: { outcome: SpeedOutcome }) {
  const { t } = useI18n();
  const penalty = outcome.wrong * PENALTY_PER_WRONG_MS;
  return (
    <div className="space-y-2">
      {outcome.isBest && <div className="text-[13px] font-black tracking-[.1em] text-gold">{t.results.newBest}</div>}
      <div className="text-[46px] font-bold leading-none tabular-nums">{formatSpeed(outcome.answeringMs + penalty)}</div>
      {/* Show the maths, so the penalty never feels arbitrary. */}
      <div className="text-xs font-medium text-fg-3">
        {outcome.wrong > 0 ? t.results.penalty(formatSpeed(outcome.answeringMs), penalty / 1000) : t.results.noPenalty}
      </div>
      {outcome.previous !== null && (
        <div className="text-xs font-medium text-fg-2">
          {outcome.isBest ? t.results.beatPrevious(formatSpeed(outcome.previous)) : t.results.yourBest(formatSpeed(outcome.previous))}
        </div>
      )}
    </div>
  );
}

export function ShareButton({ text, label, className = "" }: { text: string; label?: string; className?: string }) {
  const { t } = useI18n();
  const [toast, setToast] = useState<string | null>(null);
  const [manual, setManual] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const flash = (message: string) => {
    setToast(message);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 2500);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <>
      <button
        onClick={async () => {
          const r = await share(text);
          if (r === "copied") flash(t.results.copied);
          // Neither the share sheet nor the clipboard worked: show the text to copy by hand.
          if (r === "failed") setManual(true);
        }}
        className={`inline-flex items-center gap-1.5 rounded-full bg-fg/12 px-4 py-2.5 text-[15px] font-semibold transition hover:bg-fg/18 active:scale-[.97] ${className}`}
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
        </svg>
        {label ?? t.results.share}
      </button>
      {typeof document !== "undefined" && createPortal(
        <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          {toast && (
            <div className="animate-rise rounded-full bg-[#1c2540] px-5 py-3 text-sm font-semibold text-white shadow-2xl ring-1 ring-white/15">
              ✓ {toast}
            </div>
          )}
        </div>,
        document.body,
      )}
      {manual && <ManualCopy text={text} onClose={() => setManual(false)} onCopied={() => flash(t.results.copied)} />}
    </>
  );
}

/** Last resort when the browser allows neither sharing nor clipboard access. */
function ManualCopy({ text, onClose, onCopied }: { text: string; onClose: () => void; onCopied: () => void }) {
  const { t } = useI18n();
  const area = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    area.current?.select();
  }, []);
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={t.results.copyPrompt} className="w-full max-w-md rounded-card bg-[var(--bg-bottom)] p-5 text-fg shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-3 font-bold">{t.results.copyPrompt}</h2>
        <textarea ref={area} readOnly value={text} rows={7} className="w-full resize-none rounded-button border border-answer-line bg-answer p-3 text-sm" onFocus={(e) => e.target.select()} />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            {t.results.close}
          </Button>
          <Button
            onClick={async () => {
              area.current?.select();
              if (await copy(text)) {
                onCopied();
                onClose();
              }
            }}
          >
            {t.results.copy}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
