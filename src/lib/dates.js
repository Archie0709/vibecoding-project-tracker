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

/** e.g. "21 Oct", or "14 Feb 2027" when the date isn't in the current year. */
export function formatShortDate(iso, today = new Date()) {
  const date = parseISODate(iso);
  if (!date) return '';
  const options = { day: 'numeric', month: 'short' };
  if (date.getFullYear() !== today.getFullYear()) options.year = 'numeric';
  return date.toLocaleDateString('en-GB', options);
}

/**
 * Human-friendly length of time for a number of days (NFR-21):
 *   up to 30 days  → "N days"
 *   up to 12 months → "N months" (31–45 days reads as "1 month")
 *   beyond that    → "N years"
 * The exact date is always shown alongside, so rounding never hides precision.
 */
export function formatDuration(days) {
  const n = Math.abs(days);
  const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;
  if (n <= 30) return plural(n, 'day');
  const months = Math.max(1, Math.round(n / 30.44));
  if (months < 12) return plural(months, 'month');
  return plural(Math.max(1, Math.round(n / 365.25)), 'year');
}

/** e.g. "20 Oct, 13:20" from an ISO timestamp. */
export function formatTimestamp(isoTimestamp) {
  if (!isoTimestamp) return '';
  return new Date(isoTimestamp).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
