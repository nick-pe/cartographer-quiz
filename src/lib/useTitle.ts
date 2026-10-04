import { useEffect } from "react";

const SITE = "Cartographer — Daily World Geography Quiz";

/** Sets the tab title for the current screen. */
export function useTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · Cartographer` : SITE;
  }, [title]);
}
