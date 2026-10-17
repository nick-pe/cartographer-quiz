import { useLocation, useNavigate } from "react-router";
import { useI18n } from "../i18n";
import { LOCALES, isLocale, localizePath, stripLocale } from "../i18n/locales";
import { loadLocale } from "../i18n/registry";
import { updateSettings } from "../lib/store";

/**
 * Switches language by swapping the URL prefix, so you stay on the same page
 * (/daily → /fr/daily). The choice is remembered for later visits.
 */
export function LanguagePicker({ compact = false }: { compact?: boolean }) {
  const { code, t } = useI18n();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const current = LOCALES.find((l) => l.code === code)!;

  return (
    <label className="relative inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 sm:px-2.5 text-sm font-semibold text-fg-2 transition hover:text-fg focus-within:outline-2 focus-within:outline-blue">
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
      <span aria-hidden="true">{compact ? current.code.toUpperCase() : current.name}</span>
      <select
        aria-label={t.nav.language}
        value={code}
        onChange={(e) => {
          const next = e.target.value;
          if (!isLocale(next)) return;
          updateSettings({ language: next });
          // Fetch the language's text first, so the page switches in one step.
          void loadLocale(next).then(() => navigate(localizePath(stripLocale(pathname), next) + search, { replace: true }));
        }}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code} lang={l.code}>
            {l.name}
          </option>
        ))}
      </select>
    </label>
  );
}
