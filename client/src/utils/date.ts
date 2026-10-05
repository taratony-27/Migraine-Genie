/**
 * Log dates are stored as UTC midnight of the calendar day the user picked.
 * Rendering them through `new Date(...).toLocaleDateString()` re-interprets that
 * instant in the browser's timezone, which pushes the entry to the previous day
 * for anyone west of UTC. These helpers read the calendar day straight from the
 * value instead, so what's shown always matches what was logged.
 */

/** "2025-06-09T00:00:00.000Z" -> "2025-06-09" */
export const toDateKey = (value?: string | Date | null): string => {
  if (!value) return '';
  if (typeof value === 'string') {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  }
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
};

/** Today's calendar day in the user's own timezone, e.g. "2025-06-09". */
export const todayKey = (): string => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** "2025-06-09T00:00:00.000Z" -> "6/9/2025" (locale formatted, no TZ shift) */
export const formatLogDate = (
  value?: string | Date | null,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const key = toDateKey(value);
  if (!key) return '—';
  const [y, m, d] = key.split('-').map(Number);
  // Build in local time from the calendar parts — no instant conversion happens.
  return new Date(y, m - 1, d).toLocaleDateString(undefined, options);
};

/** Sort key for a log date, safe against timezone drift. */
export const dateSortValue = (value?: string | Date | null): number => {
  const key = toDateKey(value);
  return key ? Number(key.replace(/-/g, '')) : 0;
};
