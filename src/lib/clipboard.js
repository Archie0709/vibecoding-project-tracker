/**
 * Copies text to the clipboard.
 * Uses the modern Clipboard API, and falls back to a hidden textarea + execCommand
 * when that API is missing or blocked (e.g. plain http on some browsers).
 * Resolves true on success, false if both methods fail.
 */
export async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the fallback */
  }

  const active = document.activeElement;
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  // Append inside an open modal if there is one, so the copy works while the page is inert.
  (document.querySelector('dialog[open]') ?? document.body).appendChild(textarea);
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  textarea.remove();
  active?.focus?.(); // keep the user's place (WCAG 2.4.3 Focus Order)
  return ok;
}
