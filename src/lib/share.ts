export type ShareResult = "shared" | "cancelled" | "copied" | "failed";

/**
 * Opens the system share sheet where the browser has one (phones, Safari,
 * Edge, Chrome on macOS/Windows); otherwise copies the text. "failed" means
 * neither worked, and the caller should show the text for copying by hand.
 */
export async function share(text: string): Promise<ShareResult> {
  if (typeof navigator.share === "function" && (navigator.canShare?.({ text }) ?? true)) {
    try {
      await navigator.share({ text });
      return "shared";
    } catch (e) {
      // The person closed the sheet: that's a choice, not an error.
      if (e instanceof DOMException && e.name === "AbortError") return "cancelled";
      // Otherwise (blocked, unsupported target…) fall back to copying.
    }
  }
  return (await copy(text)) ? "copied" : "failed";
}

/** Copies text, with the old execCommand route for browsers that block the Clipboard API. */
export async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fall through.
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.cssText = "position:fixed;top:0;left:0;opacity:0";
    document.body.append(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
}
