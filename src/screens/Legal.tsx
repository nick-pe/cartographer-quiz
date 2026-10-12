// Support and Privacy, in the page's language (text in src/i18n/legal/).
import { Fragment, type ReactNode } from "react";
import { Link } from "react-router";
import { Card, LocalLink } from "../components/ui";
import { useI18n } from "../i18n";
import { LEGAL, type Block } from "../i18n/legal";
import { useTitle } from "../lib/useTitle";

/** Renders **bold** and [links](url). "/page" stays in this language; "en:/page" is the English version. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((part, i) => {
        const bold = /^\*\*(.+)\*\*$/.exec(part);
        if (bold) return <strong key={i} className="font-semibold text-fg">{bold[1]}</strong>;
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
        if (!link) return <Fragment key={i}>{part}</Fragment>;
        const [, label, url] = link;
        const style = "font-semibold text-blue underline-offset-2 hover:underline";
        if (url.startsWith("en:/")) return <Link key={i} to={url.slice(3)} className={style}>{label}</Link>;
        if (url.startsWith("/")) return <LocalLink key={i} to={url} className={style}>{label}</LocalLink>;
        return <a key={i} href={url} className={style} {...(url.startsWith("http") ? { rel: "noopener" } : {})}>{label}</a>;
      })}
    </>
  );
}

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) =>
        typeof b === "string" ? (
          <p key={i}><Rich text={b} /></p>
        ) : "list" in b ? (
          <ul key={i} className="list-disc space-y-1.5 pl-5">
            {b.list.map((item, j) => <li key={j}><Rich text={item} /></li>)}
          </ul>
        ) : (
          <h3 key={i} className="pt-2 font-bold text-fg">{b.heading}</h3>
        ),
      )}
    </>
  );
}

function Page({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-[680px] space-y-5 leading-relaxed text-fg-2">
      <h1 className="text-3xl font-bold text-fg">{title}</h1>
      {children}
    </article>
  );
}

export function Support() {
  const { code } = useI18n();
  const s = LEGAL[code].support;
  useTitle(s.title);
  return (
    <Page title={s.title}>
      <p className="text-lg"><Rich text={s.intro} /></p>
      <Card className="space-y-2 p-5">
        <h2 className="font-bold text-fg">{s.dataTitle}</h2>
        <p><Rich text={s.dataBody} /></p>
      </Card>
      <h2 className="pt-2 text-xl font-bold text-fg">{s.faqTitle}</h2>
      {s.faq.map((item) => (
        <Card key={item.q} className="space-y-2 p-5">
          <h3 className="font-bold text-fg">{item.q}</h3>
          <p><Rich text={item.a} /></p>
        </Card>
      ))}
      <h2 className="pt-2 text-xl font-bold text-fg">{s.contactTitle}</h2>
      <p><Rich text={s.contactBody} /></p>
    </Page>
  );
}

export function Privacy() {
  const { code } = useI18n();
  const p = LEGAL[code].privacy;
  useTitle(p.title);
  return (
    <Page title={p.title}>
      <p className="text-sm text-fg-3">{p.updated}</p>
      {p.note && <p className="rounded-button bg-fg/6 p-3 text-sm"><Rich text={p.note} /></p>}
      {p.sections.map((section, i) => (
        <section key={i} className="space-y-3">
          {section.title && <h2 className="pt-3 text-xl font-bold text-fg">{section.title}</h2>}
          <Blocks blocks={section.blocks} />
        </section>
      ))}
    </Page>
  );
}
