import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False while React takes over a pre-rendered page (and on the server), true
 * afterwards. Anything that differs between build time and now (today's date,
 * a live quiz) waits for true, so the first client render matches the HTML.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
