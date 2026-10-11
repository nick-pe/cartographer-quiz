// Port of Views/ResultsView.swift, plus the web's answer review.
import { useState, type ReactNode } from "react";
import { TIERS, type Difficulty } from "../lib/engine/difficulty";
import { PENALTY_PER_WRONG_MS, formatSpeed } from "../lib/engine/speedRun";
import { share } from "../lib/share";
import type { Answer } from "./QuizRunner";
import { useI18n } from "../i18n";
import { Review, ScoreRing, stars } from "./Review";
import { Button, Card, DifficultyChip, LinkButton, Stars } from "./ui";

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
}

export function Results({ title, difficulty, answers, extra, shareText, onTryHarder, onPlayAgain }: Props) {
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
  const [status, setStatus] = useState<string | null>(null);
  return (
    <div className="relative inline-flex flex-col items-center">
      <button
        onClick={async () => {
          const r = await share(text);
          setStatus(r === "copied" ? t.results.copied : r === "failed" ? t.results.shareFailed : null);
        }}
        className={`inline-flex items-center gap-1.5 rounded-full bg-fg/12 px-4 py-2.5 text-[15px] font-semibold transition hover:bg-fg/18 active:scale-[.97] ${className}`}
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
        </svg>
        {label ?? t.results.share}
      </button>
      <span role="status" className="absolute top-full mt-1 whitespace-nowrap text-xs font-medium text-correct">
        {status}
      </span>
    </div>
  );
}
