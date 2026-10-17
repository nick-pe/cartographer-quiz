import { useMemo, useRef, useState } from "react";
import { Navigate, useParams } from "react-router";
import { Backdrop } from "../components/Backdrop";
import { QuizRunner, type RunResult } from "../components/QuizRunner";
import { Results, SpeedRunBlock, type SpeedOutcome } from "../components/Results";
import { dateKey } from "../lib/engine/dates";
import { type Difficulty } from "../lib/engine/difficulty";
import { useI18n, type I18n } from "../i18n";
import { QUIZ_BY_SLUG, type QuizDef } from "../lib/engine/quizzes";
import { PENALTY_PER_WRONG_MS, formatSpeed } from "../lib/engine/speedRun";
import { recordAttempt, recordSpeedRun, updateSettings, useStore } from "../lib/store";
import { SITE_URL } from "../lib/site";
import { useTitle } from "../lib/useTitle";
import { useHydrated } from "../lib/useHydrated";
import { Flag } from "../components/Flag";
import { DIFFICULTIES } from "../lib/engine/difficulty";
import { cellText, factText } from "../lib/facts";
import { LEARNABLE, sampleRows, studySlugFor } from "../lib/learn";
import { sectionsFor } from "../lib/sections";
import { LinkButton, LocalLink } from "../components/ui";

export function Quiz() {
  const { slug } = useParams();
  const quiz = slug ? QUIZ_BY_SLUG[slug] : undefined;
  const { path } = useI18n();
  const hydrated = useHydrated();
  if (!quiz) return <Navigate to={path("/")} replace />;
  // Pre-rendered pages describe the quiz; once the browser has taken over, the live game starts.
  return (
    <>
      {hydrated ? <Play key={quiz.slug} quiz={quiz} /> : <QuizIntro quiz={quiz} />}
      <QuizAbout key={`about-${quiz.slug}`} quiz={quiz} />
    </>
  );
}

interface Finished {
  run: RunResult;
  difficulty: Difficulty;
  speed?: SpeedOutcome;
}

function Play({ quiz }: { quiz: QuizDef }) {
  const i18n = useI18n();
  const title = i18n.quizTitle(quiz);
  useTitle(title);
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
          title={title}
          difficulty={finished.difficulty}
          answers={finished.run.answers}
          extra={finished.speed && <SpeedRunBlock outcome={finished.speed} />}
          shareText={resultText(i18n, quiz, finished)}
          onTryHarder={(tier) => {
            updateSettings({ difficulty: tier });
            restart();
          }}
          onPlayAgain={restart}
          studySlug={studySlugFor(quiz)}
        />
      ) : (
        <>
          <h1 className="sr-only">{title}</h1>
          <QuizRunner key={round} questions={questions} difficulty={difficulty} speedRun={quiz.isSpeedRun} onFinish={onFinish} />
        </>
      )}
    </>
  );
}

function QuizIntro({ quiz }: { quiz: QuizDef }) {
  const i18n = useI18n();
  const title = i18n.quizTitle(quiz);
  const study = studySlugFor(quiz);
  return (
    <section className="mx-auto max-w-[620px] space-y-4 py-6 text-center">
      <div className="text-5xl" aria-hidden="true">{quiz.emoji}</div>
      <h1 className="text-3xl font-bold">{title}</h1>
      <LinkButton to={`/quiz/${quiz.slug}`}>▶ {i18n.t.nav.play}</LinkButton>
      {study && (
        <p>
          <LocalLink to={`/learn/${study}`} className="text-sm font-semibold text-blue">
            📖 {i18n.t.learn.studyList}
          </LocalLink>
        </p>
      )}
    </section>
  );
}

/** Below the game: what the quiz covers, a sample, the levels and similar quizzes.
 *  The same on the server and in the browser, so search engines index it with the game. */
function QuizAbout({ quiz }: { quiz: QuizDef }) {
  const i18n = useI18n();
  const { t } = i18n;
  const title = i18n.quizTitle(quiz);
  const study = studySlugFor(quiz);
  const facts = study ? factText(i18n, QUIZ_BY_SLUG[study]) : null;
  const sample = sampleRows(quiz);
  const section = sectionsFor(i18n.code).find((s) => s.quizzes.includes(quiz));
  const related = (section?.quizzes ?? []).filter((q) => q !== quiz).slice(0, 10);
  // Mixed quizzes have no list of their own: point at the lists they draw from.
  const sources = study ? [] : LEARNABLE.filter((q) => MIX_SOURCES.includes(q.id));
  const chip = "inline-block rounded-full bg-fg/8 px-3 py-1.5 text-sm font-medium hover:bg-fg/14";

  return (
    <section aria-labelledby="about-quiz" className="mx-auto mt-12 max-w-[620px] space-y-6 border-t border-surface-line pt-8 text-sm">
      <div className="space-y-2">
        <h2 id="about-quiz" className="text-lg font-bold">{t.quizPage.about}</h2>
        <p className="text-fg-2">{t.seo.quiz(title, i18n.quizSubtitle(quiz))}</p>
        {facts && <p className="text-fg-2">{facts}</p>}
      </div>

      {sample.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold">{t.quizPage.sample}</h3>
          <ul className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
            {sample.map((row) => (
              <li key={row.map((c) => cellText(i18n, c)).join("|")} className="flex items-center gap-2">
                {"flag" in row[0] && row[0].flag && <Flag code={row[0].flag} alt="" lazy className="w-6 shrink-0 rounded-sm shadow-none" />}
                <span className="font-semibold">{cellText(i18n, row[0])}</span>
                {row[1] && <span className="text-fg-2">· {cellText(i18n, row[1])}</span>}
              </li>
            ))}
          </ul>
          <p>
            <LocalLink to={`/learn/${study}`} className="font-semibold text-blue">📖 {t.quizPage.seeAll} →</LocalLink>
          </p>
        </div>
      )}

      {sources.length > 0 && (
        <div className="space-y-2">
          <p className="text-fg-2">{t.quizPage.mixFrom}</p>
          <ul className="flex flex-wrap gap-2">
            {sources.map((q) => (
              <li key={q.id}>
                <LocalLink to={`/learn/${q.slug}`} className={chip}>{q.emoji} {i18n.quizTitle(q)}</LocalLink>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="font-bold">{t.quizPage.levels}</h3>
        <ul className="space-y-1">
          {DIFFICULTIES.map((d) => (
            <li key={d}>
              <span className="font-semibold">{t.tiers[d].title}</span> <span className="text-fg-2">· {t.tiers[d].blurb}</span>
            </li>
          ))}
        </ul>
      </div>

      {related.length > 0 && (
        <nav aria-label={t.quizPage.related} className="space-y-2">
          <h3 className="font-bold">{t.quizPage.related}</h3>
          <ul className="flex flex-wrap gap-2">
            {related.map((q) => (
              <li key={q.id}>
                <LocalLink to={`/quiz/${q.slug}`} className={chip}>{q.emoji} {i18n.quizTitle(q)}</LocalLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </section>
  );
}

const MIX_SOURCES = ["category.worldCapitals", "flags", "howManyRegions", "rivers", "mountains", "seas", "islands"];

function resultText(i18n: I18n, quiz: QuizDef, { run, difficulty, speed }: Finished): string {
  const { t } = i18n;
  const title = i18n.quizTitle(quiz);
  const correct = run.answers.filter((a) => a.correct).length;
  const score = speed
    ? `⚡ ${title}: ${formatSpeed(speed.answeringMs + speed.wrong * PENALTY_PER_WRONG_MS)} (${correct}/${run.answers.length})`
    : `${quiz.emoji} ${title}: ${correct}/${run.answers.length}`;
  return [`Cartographer · ${t.tiers[difficulty].title}`, score, "", t.share.invite, SITE_URL + i18n.path(`/quiz/${quiz.slug}`)].join("\n");
}
