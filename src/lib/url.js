/**
 * Validates a link typed by the user (DR-05: must be a valid http/https URL).
 * Adds "https://" when the scheme is missing, so "docs.google.com/…" is accepted.
 * Returns the normalised URL, or null if it isn't a usable web link.
 * Only http/https are allowed so a "javascript:" link can never be stored and clicked.
 */
export function normaliseUrl(input) {
  const raw = input.trim();
  if (!raw) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (!url.hostname.includes('.') && url.hostname !== 'localhost') return null;
    return url.href;
  } catch {
    return null;
  }
}

/** Short, readable form of a link for display, e.g. "docs.google.com". */
export function displayHost(href) {
  try {
    return new URL(href).hostname.replace(/^www\./, '');
  } catch {
    return href;
  }
}
