// Study lists: every quiz's full data as a table, in the page's language,
// with a way into the quiz. Pre-rendered, so search engines see the content.
import { useMemo } from "react";
import { Navigate, useParams } from "react-router";
import { Flag } from "../components/Flag";
import { Card, LinkButton, LocalLink } from "../components/ui";
import { useI18n } from "../i18n";
import { HOME_SECTIONS, QUIZ_BY_SLUG, gradientCss, type QuizDef } from "../lib/engine/quizzes";
import { cellText, factText } from "../lib/facts";
import { LEARNABLE, capitalsOf, learnTable } from "../lib/learn";
import { sectionsFor } from "../lib/sections";
import { useTitle } from "../lib/useTitle";

export function Learn() {
  const { slug } = useParams();
  const { path } = useI18n();
  if (!slug) return <LearnIndex />;
  const quiz = QUIZ_BY_SLUG[slug];
  if (!quiz || !LEARNABLE.includes(quiz)) return <Navigate to={path("/learn")} replace />;
  return <LearnPage quiz={quiz} />;
}

function LearnPage({ quiz }: { quiz: QuizDef }) {
  const i18n = useI18n();
  const { t } = i18n;
  const title = i18n.quizTitle(quiz);
  useTitle(t.seo.learnTitle(title, i18n.quizSubtitle(quiz), capitalsOf(quiz)));
  const table = useMemo(() => learnTable(quiz)!, [quiz]);
  const facts = factText(i18n, quiz);
  const rows = useMemo(() => {
    const text = table.rows.map((r) => ({ cells: r, text: r.map((c) => cellText(i18n, c)) }));
    if (table.ranked) return text;
    const collator = new Intl.Collator(i18n.info.intl);
    return text.sort((a, b) => collator.compare(a.text[0], b.text[0]));
  }, [table, i18n]);
  const section = HOME_SECTIONS.find((s) => s.quizzes.includes(quiz));
  const more = (section?.quizzes ?? []).filter((q) => q !== quiz && LEARNABLE.includes(q));

  return (
    <article className="mx-auto max-w-[760px] space-y-6">
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-button text-2xl" style={{ background: gradientCss(quiz.gradient) }} aria-hidden="true">
            {quiz.emoji}
          </span>
          <h1 className="text-2xl font-bold sm:text-3xl">{t.learn.title(title)}</h1>
        </div>
        <p className="text-fg-2">{t.learn.intro(i18n.quizSubtitle(quiz))}</p>
        {facts && <p className="text-fg-2">{facts}</p>}
        <LinkButton to={`/quiz/${quiz.slug}`}>▶ {t.learn.takeQuiz}</LinkButton>
      </header>

      {table.gallery ? (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {rows.map(({ cells, text }) => {
            const cell = cells[0] as { flag?: string };
            return (
              <li key={text[0]} className="flex flex-col items-center gap-1.5 text-center">
                {cell.flag && <Flag code={cell.flag} alt={text[0]} lazy className="w-full shadow-md" />}
                <span className="text-xs font-medium leading-tight">{text[0]}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-surface-line text-xs uppercase text-fg-3">
              <tr>
                {table.ranked && <th className="py-2.5 pl-4 font-semibold">#</th>}
                {table.columns.map((c, i) => (
                  <th key={c} className={`py-2.5 font-semibold ${i === 0 && !table.ranked ? "pl-4" : "pl-3"} last:pr-4`}>
                    {t.learn.columns[c]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-line">
              {rows.map(({ cells, text }, r) => (
                <tr key={text.join("|")}>
                  {table.ranked && <td className="py-2 pl-4 tabular-nums text-fg-3">{r + 1}</td>}
                  {cells.map((cell, i) => (
                    <td key={i} className={`py-2 align-top ${i === 0 ? `${table.ranked ? "pl-3" : "pl-4"} font-semibold` : "pl-3 text-fg-2"} last:pr-4 ${"num" in cell ? "whitespace-nowrap tabular-nums" : ""}`}>
                      <span className="flex items-center gap-2">
                        {"flag" in cell && cell.flag && i === 0 && <Flag code={cell.flag} alt="" lazy className="w-6 shrink-0 rounded-sm shadow-none" />}
                        {text[i]}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <div className="flex justify-center">
        <LinkButton to={`/quiz/${quiz.slug}`}>▶ {t.learn.takeQuiz}</LinkButton>
      </div>

      {more.length > 0 && (
        <nav aria-label={t.learn.more} className="space-y-2">
          <h2 className="text-lg font-bold">{t.learn.more}</h2>
          <ul className="flex flex-wrap gap-2">
            {more.map((q) => (
              <li key={q.id}>
                <LocalLink to={`/learn/${q.slug}`} className="inline-block rounded-full bg-fg/8 px-3 py-1.5 text-sm font-medium hover:bg-fg/14">
                  {q.emoji} {i18n.quizTitle(q)}
                </LocalLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </article>
  );
}

function LearnIndex() {
  const i18n = useI18n();
  const { t } = i18n;
  const sections = sectionsFor(i18n.code);
  useTitle(t.learn.index);
  return (
    <div className="mx-auto max-w-[860px] space-y-7">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">{t.learn.index}</h1>
        <p className="text-fg-2">{t.learn.indexIntro}</p>
      </header>
      {sections.map((section) => {
        const quizzes = section.quizzes.filter((q) => LEARNABLE.includes(q));
        if (!quizzes.length) return null;
        return (
          <section key={section.id} className="space-y-3">
            <h2 className="text-xl font-bold">{t.home.sections[section.id]}</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {quizzes.map((q) => (
                <li key={q.id}>
                  <LocalLink to={`/learn/${q.slug}`} className="flex items-center gap-3 rounded-button border border-surface-line bg-surface p-3 transition hover:border-blue/60">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg text-xl" style={{ background: gradientCss(q.gradient) }} aria-hidden="true">
                      {q.emoji}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{i18n.quizTitle(q)}</span>
                      <span className="block text-xs text-fg-3">{i18n.quizSubtitle(q)}</span>
                    </span>
                  </LocalLink>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
