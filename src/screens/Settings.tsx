import { useState } from "react";
import { LanguagePicker } from "../components/LanguagePicker";
import { Button, Card, Segmented } from "../components/ui";
import { useI18n } from "../i18n";
import { deleteAllHistory, updateSettings, useStore, type Theme } from "../lib/store";
import { useTitle } from "../lib/useTitle";

const THEMES: Theme[] = ["system", "light", "dark"];

export function Settings() {
  const { t } = useI18n();
  useTitle(t.settings.title);
  const settings = useStore((s) => s.settings);
  const [confirming, setConfirming] = useState(false);
  const [deleted, setDeleted] = useState(false);

  return (
    <div className="mx-auto max-w-[620px] animate-rise space-y-6">
      <h1 className="text-3xl font-bold">{t.settings.title}</h1>

      <Card className="divide-y divide-surface-line">
        <div className="flex items-center justify-between gap-6 p-5">
          <div>
            <div className="font-semibold">{t.settings.appearance}</div>
          </div>
          <Segmented
            label={t.settings.appearance}
            value={settings.theme}
            options={THEMES.map((id) => ({ id, name: t.settings.themes[id] }))}
            onChange={(theme) => updateSettings({ theme })}
          />
        </div>
        <div className="flex items-center justify-between gap-6 p-5">
          <div className="font-semibold">{t.settings.language}</div>
          <LanguagePicker />
        </div>
        <label className="flex cursor-pointer items-center justify-between gap-6 p-5">
          <div>
            <div className="font-semibold">{t.settings.record}</div>
            <div className="text-sm text-fg-2">{t.settings.recordHelp}</div>
          </div>
          <input
            type="checkbox"
            role="switch"
            checked={settings.recordHistory}
            onChange={(e) => updateSettings({ recordHistory: e.target.checked })}
            className="peer sr-only"
          />
          <span className="relative h-7 w-12 shrink-0 rounded-full bg-fg/15 transition peer-checked:bg-correct peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue after:absolute after:left-0.5 after:top-0.5 after:size-6 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
        </label>
      </Card>

      <Card className="p-5">
        <div className="font-semibold">{t.settings.deleteAll}</div>
        <p className="mt-1 text-sm text-fg-2">{t.settings.deleteHelp}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {confirming ? (
            <>
              <Button
                variant="danger"
                onClick={() => {
                  deleteAllHistory();
                  setConfirming(false);
                  setDeleted(true);
                }}
              >
                {t.settings.confirmDelete}
              </Button>
              <Button variant="ghost" onClick={() => setConfirming(false)}>
                {t.settings.cancel}
              </Button>
            </>
          ) : (
            <Button variant="ghost" className="text-wrong" onClick={() => { setConfirming(true); setDeleted(false); }}>
              {t.settings.deleteAll}
            </Button>
          )}
          <span role="status" className="text-sm text-correct">{deleted && t.settings.deleted}</span>
        </div>
      </Card>

      <Card className="p-5 text-sm text-fg-2">
        <div className="mb-1 font-semibold text-fg">{t.settings.privacyTitle}</div>
        {t.settings.privacyBody}
      </Card>
    </div>
  );
}
