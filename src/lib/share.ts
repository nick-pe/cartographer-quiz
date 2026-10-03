/** Opens the system share sheet where there is one, otherwise copies to the clipboard. */
export async function share(text: string): Promise<"shared" | "copied" | "failed"> {
  try {
    if (navigator.share && matchMedia("(pointer: coarse)").matches) {
      await navigator.share({ text });
      return "shared";
    }
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") return "shared";
    return "failed";
  }
}
