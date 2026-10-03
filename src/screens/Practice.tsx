import { useMemo, useState } from "react";
import { Navigate, useParams } from "react-router";
import { QuizRunner, type Answer } from "../components/QuizRunner";
import { Review, ScoreRing, verdict } from "../components/Review";
import { Button, Card, LinkButton } from "../components/ui";
import { formatDuration } from "../lib/daily";
import { KINDS, LEVELS, type Level, type QuizKind } from "../lib/levels";
import { makeQuiz } from "../lib/quiz";
import { seeded } from "../lib/random";
import { recordResult } from "../lib/store";

const LENGTH = 10;

export function Practice() {
  const { kind, level } = useParams();
  if (!kind || !(kind in KINDS) || !level || !(level in LEVELS)) return <Navigate to="/" replace />;
  return <PracticeRound key={`${kind}/${level}`} kind={kind as QuizKind} level={level as Level} />;
}

function PracticeRound({ kind, level }: { kind: QuizKind; level: Level }) {
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<{ answers: Answer[]; ms: number } | null>(null);
  const questions = useMemo(() => makeQuiz(kind, level, LENGTH, seeded(Date.now() + round)), [kind, level, round]);
  const title = `${KINDS[kind].name} · ${LEVELS[level].name}`;

  if (!result) {
    return (
      <QuizRunner
        key={round}
        title={title}
        questions={questions}
        seconds={LEVELS[level].seconds}
        onFinish={(answers, ms) => {
          const score = answers.filter((a) => a.correct).length;
          recordResult({ quiz: KINDS[kind].name, level, score, total: answers.length, durationMs: ms });
          setResult({ answers, ms });
        }}
      />
    );
  }

  const score = result.answers.filter((a) => a.correct).length;
  return (
    <div className="mx-auto max-w-xl animate-rise space-y-6">
      <Card className="flex flex-col items-center p-8 text-center">
        <div className="mb-4 text-sm font-medium text-slate-500 dark:text-slate-400">{title}</div>
        <ScoreRing score={score} total={result.answers.length} />
        <h1 className="mt-5 text-2xl font-bold tracking-tight">{verdict(score, result.answers.length)}</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Finished in {formatDuration(result.ms)}</p>
        <div className="mt-6 flex gap-3">
          <Button
            onClick={() => {
              setResult(null);
              setRound((r) => r + 1);
            }}
          >
            Play again
          </Button>
          <LinkButton to="/" variant="ghost">
            Home
          </LinkButton>
        </div>
      </Card>
      <Card className="px-5 py-2">
        <Review answers={result.answers} />
      </Card>
    </div>
  );
}
