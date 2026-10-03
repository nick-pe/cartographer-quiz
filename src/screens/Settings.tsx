import { useState } from "react";
import { Button, Card, Segmented } from "../components/ui";
import { deleteAllHistory, updateSettings, useStore, type Theme } from "../lib/store";

const THEMES: { id: Theme; name: string }[] = [
  { id: "system", name: "System" },
  { id: "light", name: "Light" },
  { id: "dark", name: "Dark" },
];

export function Settings() {
  const settings = useStore((s) => s.settings);
  const [confirming, setConfirming] = useState(false);
  const [deleted, setDeleted] = useState(false);

  return (
    <div className="animate-rise space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <Card className="divide-y divide-black/5 dark:divide-white/5">
        <div className="flex items-center justify-between gap-6 p-5">
          <div>
            <div className="font-semibold">Appearance</div>
          </div>
          <Segmented label="Appearance" value={settings.theme} options={THEMES} onChange={(theme) => updateSettings({ theme })} />
        </div>
        <label className="flex cursor-pointer items-center justify-between gap-6 p-5">
          <div>
            <div className="font-semibold">Record quiz history</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Turning this off stops new results and Speed Run bests being saved. Existing results stay until you delete them.
            </div>
          </div>
          <input
            type="checkbox"
            role="switch"
            checked={settings.recordHistory}
            onChange={(e) => updateSettings({ recordHistory: e.target.checked })}
            className="peer sr-only"
          />
          <span className="relative h-7 w-12 shrink-0 rounded-full bg-black/15 transition peer-checked:bg-emerald-500 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-violet-brand after:absolute after:left-0.5 after:top-0.5 after:size-6 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5 dark:bg-white/15" />
        </label>
      </Card>

      <Card className="p-5">
        <div className="font-semibold">Delete All History</div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Permanently erases your results, Daily Challenge record, streak and Speed Run bests from this browser. This can’t be undone.
        </p>
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
                Yes, delete everything
              </Button>
              <Button variant="ghost" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="ghost" className="text-rose-600 dark:text-rose-400" onClick={() => { setConfirming(true); setDeleted(false); }}>
              Delete All History
            </Button>
          )}
          <span role="status" className="text-sm text-emerald-600 dark:text-emerald-400">{deleted && "All history deleted."}</span>
        </div>
      </Card>

      <Card className="p-5 text-sm text-slate-600 dark:text-slate-300">
        <div className="mb-1 font-semibold text-ink dark:text-white">Your data stays here</div>
        Everything is stored in this browser only. Cartographer has no accounts, no analytics and no ads, and sends nothing
        to any server. Your history doesn’t sync with the iPhone app or between browsers.
      </Card>
    </div>
  );
}
