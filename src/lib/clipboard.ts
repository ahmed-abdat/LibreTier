/**
 * Copy a string to the clipboard. Uses the modern Clipboard API when
 * available, falling back to a hidden <textarea> + execCommand for older
 * browsers. Resolves on success, rejects on failure of both paths.
 */
export async function copyToClipboard(text: string): Promise<void> {
  // navigator.clipboard is undefined on insecure contexts and very old browsers,
  // even though TypeScript's lib.dom marks it non-nullable. Hence the cast.
  const clipboard =
    typeof navigator !== "undefined"
      ? (navigator.clipboard as Clipboard | undefined)
      : undefined;
  if (clipboard) {
    try {
      await clipboard.writeText(text);
      return;
    } catch {
      // Fall through to execCommand fallback below.
    }
  }

  if (typeof document === "undefined") {
    throw new Error("Clipboard not available in this environment");
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const ok = document.execCommand("copy");
    if (!ok) throw new Error("execCommand('copy') returned false");
  } finally {
    document.body.removeChild(textarea);
  }
}
