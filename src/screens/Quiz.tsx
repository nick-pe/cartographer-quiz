import { useMemo, useRef, useState } from "react";
import { Navigate, useParams } from "react-router";
import { Backdrop } from "../components/Backdrop";
import { QuizRunner, type RunResult } from "../components/QuizRunner";
import { Results, SpeedRunBlock, type SpeedOutcome } from "../components/Results";
import { dateKey } from "../lib/engine/dates";
import { TIERS, type Difficulty } from "../lib/engine/difficulty";
import { QUIZ_BY_SLUG, type QuizDef } from "../lib/engine/quizzes";
import { PENALTY_PER_WRONG_MS } from "../lib/engine/speedRun";
import { recordAttempt, recordSpeedRun, updateSettings, useStore } from "../lib/store";
import { SITE_URL } from "../lib/site";
import { useTitle } from "../lib/useTitle";

export function Quiz() {
  const { slug } = useParams();
  const quiz = slug ? QUIZ_BY_SLUG[slug] : undefined;
  if (!quiz) return <Navigate to="/" replace />;
  return <Play key={quiz.slug} quiz={quiz} />;
}

interface Finished {
  run: RunResult;
  difficulty: Difficulty;
  speed?: SpeedOutcome;
}

function Play({ quiz }: { quiz: QuizDef }) {
  useTitle(quiz.title);
  const difficulty = useStore((s) => s.settings.difficulty);
  const [round, setRound] = useState(0);
  const [finished, setFinished] = useState<Finished | null>(null);
  // `round` is a dependency so Play Again deals new questions.
  const questions = useMemo(() => quiz.make(difficulty), [quiz, difficulty, round]);
  // Attempts are filed under the day they started, like the app.
  const startedDay = useRef(dateKey());

  const restart = () => {
    startedDay.current = dateKey();
    setFinished(null);
    setRound((r) => r + 1);
    window.scrollTo(0, 0);
  };

  const onFinish = (run: RunResult) => {
    const correct = run.answers.filter((a) => a.correct).length;
    const wrong = run.answers.length - correct;
    let speed: SpeedOutcome | undefined;
    if (quiz.isSpeedRun) {
      const { isBest, previous } = recordSpeedRun(difficulty, run.answeringMs + wrong * PENALTY_PER_WRONG_MS);
      speed = { answeringMs: run.answeringMs, wrong, isBest, previous };
    }
    recordAttempt({
      quizId: quiz.id,
      quizTitle: quiz.title,
      difficulty,
      total: run.answers.length,
      correct,
      durationMs: run.totalMs,
      timedOut: run.answers.filter((a) => a.picked === null).length,
      dayKey: startedDay.current,
    });
    setFinished({ run, difficulty, speed });
    window.scrollTo(0, 0);
  };

  return (
    <>
      <Backdrop id={quiz.backdrop} />
      {finished ? (
        <Results
          title={quiz.title}
          difficulty={finished.difficulty}
          answers={finished.run.answers}
          extra={finished.speed && <SpeedRunBlock outcome={finished.speed} />}
          shareText={resultText(quiz, finished)}
          onTryHarder={(tier) => {
            updateSettings({ difficulty: tier });
            restart();
          }}
          onPlayAgain={restart}
        />
      ) : (
        <>
          <h1 className="sr-only">{quiz.title}</h1>
          <QuizRunner key={round} questions={questions} difficulty={difficulty} speedRun={quiz.isSpeedRun} onFinish={onFinish} />
        </>
      )}
    </>
  );
}

function resultText(quiz: QuizDef, { run, difficulty, speed }: Finished): string {
  const correct = run.answers.filter((a) => a.correct).length;
  const score = speed
    ? `⚡ ${quiz.title}: ${((speed.answeringMs + speed.wrong * PENALTY_PER_WRONG_MS) / 1000).toFixed(1)}s (${correct}/${run.answers.length})`
    : `${quiz.emoji} ${quiz.title}: ${correct}/${run.answers.length}`;
  return [`Cartographer · ${TIERS[difficulty].title}`, score, "", "Think you can beat that?", `${SITE_URL}/quiz/${quiz.slug}`].join("\n");
}
