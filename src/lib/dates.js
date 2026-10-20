// Date helpers. All task dates are plain local dates in ISO 'YYYY-MM-DD' form.

export function toISODate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** ISO date `days` days from today (negative = in the past). */
export function isoDaysFromToday(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** Parse an ISO date as a local date (avoids the UTC off-by-one bug). */
export function parseISODate(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** e.g. "21 Oct" */
export function formatShortDate(iso) {
  const date = parseISODate(iso);
  if (!date) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
