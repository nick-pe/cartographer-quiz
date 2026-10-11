import { useEffect } from "react";
import { useI18n } from "../i18n";

/** Sets the tab title for the current screen, in the page's language. */
export function useTitle(title?: string) {
  const { t } = useI18n();
  useEffect(() => {
    document.title = title ? t.site.pageTitle(title) : t.site.title;
  }, [title, t]);
}
