import { useI18n } from "../i18n";
import { asset } from "../lib/site";

/** `alt` defaults to a generic label, so a flag in a quiz never gives the answer away. */
export function Flag({ code, className = "", alt, lazy }: { code: string; className?: string; alt?: string; lazy?: boolean }) {
  const { t } = useI18n();
  return (
    <img
      src={asset(`flags/${code.toLowerCase()}.svg`)}
      // Generic on purpose: a country name here would give the answer away.
      alt={alt ?? t.quiz.flagAlt}
      loading={lazy ? "lazy" : undefined}
      // Long lists: let text, fonts and code load before the flags.
      fetchPriority={lazy ? "low" : undefined}
      decoding={lazy ? "async" : undefined}
      draggable={false}
      className={`aspect-[4/3] rounded-lg object-cover shadow-lg ring-1 ring-black/10 dark:ring-white/10 ${className}`}
    />
  );
}
