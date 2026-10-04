import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { Backdrop } from "../components/Backdrop";
import { QuizRunner, type Answer, type RunResult } from "../components/QuizRunner";
import { Results, ShareButton } from "../components/Results";
import { Button, Card, DifficultyChip, LinkButton } from "../components/ui";
import { DAILY_DIFFICULTY, DAILY_LENGTH, dailyNumber, dailyQuiz, emojiGrid, shareText } from "../lib/engine/daily";
import { dateKey } from "../lib/engine/dates";
import { TIERS } from "../lib/engine/difficulty";
import { recordAttempt, recordDaily, useStore, useStreaks } from "../lib/store";
import { useTitle } from "../lib/useTitle";

export function Daily() {
  useTitle("Daily Challenge");
  // Keyed to when the puzzle was opened: finishing after midnight must not
  // file yesterday's puzzle as today's and lock you out of the real one.
  const today = useRef(dateKey()).current;
  const questions = useMemo(() => dailyQuiz(today), [today]);
  const result = useStore((s) => s.daily[today]);
  const [params] = useSearchParams();
  const [playing, setPlaying] = useState(params.has("start"));

  const onFinish = ({ answers, totalMs }: RunResult) => {
    const grid = answers.map((a) => a.correct);
    recordDaily(today, { grid, picks: answers.map((a) => a.picked), durationMs: totalMs });
    recordAttempt({
      quizId: "dailyChallenge",
      quizTitle: "Daily Challenge",
      difficulty: DAILY_DIFFICULTY,
      total: answers.length,
      correct: grid.filter(Boolean).length,
      durationMs: totalMs,
      timedOut: answers.filter((a) => a.picked === null).length,
      dayKey: today,
    });
    setPlaying(false);
    window.scrollTo(0, 0);
  };

  let body;
  if (result) body = <DailyResult today={today} />;
  else if (playing) body = <QuizRunner questions={questions} difficulty={DAILY_DIFFICULTY} onFinish={onFinish} />;
  else {
    body = (
      <Card className="mx-auto max-w-[620px] animate-rise p-8 text-center">
        <div className="mb-2 text-xs font-black tracking-[.1em] text-flame">DAILY CHALLENGE · #{dailyNumber(today)}</div>
        <h1 className="text-3xl font-bold">Ready, cartographer?</h1>
        <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-fg-2">
          <li className="flex gap-3"><span className="text-gold">◆</span>{DAILY_LENGTH} questions from every kind of quiz, flags included.</li>
          <li className="flex gap-3"><span className="text-gold">◆</span>The same puzzle for everyone today.</li>
          <li className="flex gap-3"><span className="text-gold">◆</span>{TIERS[DAILY_DIFFICULTY].seconds}s per question, and one attempt only.</li>
        </ul>
        <div className="mt-5 flex justify-center"><DifficultyChip difficulty={DAILY_DIFFICULTY} /></div>
        <Button className="mt-6 w-full sm:w-auto" onClick={() => setPlaying(true)}>
          Start today’s challenge
        </Button>
      </Card>
    );
  }

  return (
    <>
      <Backdrop id="temperate" />
      {body}
    </>
  );
}

function DailyResult({ today }: { today: string }) {
  const result = useStore((s) => s.daily[today])!;
  const { current } = useStreaks();
  const questions = useMemo(() => dailyQuiz(today), [today]);
  const score = result.grid.filter(Boolean).length;

  const block = (
    <div className="space-y-2.5">
      <div className="text-2xl leading-none" aria-label={`${score} of ${result.grid.length} correct`}>
        {emojiGrid(result.grid)}
      </div>
      <ShareButton text={shareText(today, result.grid, current)} />
      <NextIn />
    </div>
  );

  if (result.legacy) {
    // Played on the first version of the site, whose questions were different.
    return (
      <Card className="mx-auto flex max-w-[620px] animate-rise flex-col items-center gap-4 p-8 text-center">
        <div className="text-xs font-black tracking-[.1em] text-flame">DAILY CHALLENGE · #{dailyNumber(today)}</div>
        <div className="text-[34px] font-bold">
          {score}/{result.grid.length}
        </div>
        {block}
        <LinkButton to="/" variant="violet" className="w-full">Back to Home</LinkButton>
      </Card>
    );
  }

  const answers: Answer[] = questions.map((question, i) => ({ question, picked: result.picks[i] ?? null, correct: result.grid[i], ms: 0 }));
  return <Results title={`Daily Challenge #${dailyNumber(today)}`} difficulty={DAILY_DIFFICULTY} answers={answers} extra={block} />;
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
    <p className="text-xs font-medium text-fg-3">
      Next quiz in <span className="font-semibold tabular-nums text-fg">{`${hh}:${mm}:${ss}`}</span>
    </p>
  );
}
