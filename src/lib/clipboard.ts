/**
 * Clipboard helper with graceful degradation.
 * Uses async Clipboard API when available, falls back to the legacy
 * execCommand("copy") trick (works in restricted contexts: iframes,
 * older browsers, headless automation without granted permissions).
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // 1) modern async API
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    /* fall through to legacy path */
  }

  // 2) legacy fallback
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
