import type { ISODate } from '@/types';

/** Local-calendar date helpers. Everything here stays in the device timezone. */

export function toISODate(date: Date): ISODate {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Parses `YYYY-MM-DD` as local midnight — `new Date(iso)` would parse it as UTC. */
export function fromISODate(iso: ISODate): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function todayISO(): ISODate {
  return toISODate(new Date());
}

export function monthKey(iso: ISODate): string {
  return iso.slice(0, 7);
}

export function currentMonthKey(): string {
  return monthKey(todayISO());
}

export function addMonths(key: string, delta: number): string {
  const [year, month] = key.split('-').map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;
}

export function startOfWeek(date: Date): Date {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  // Monday-first, matching the habit tracker mock-ups in the product spec.
  const weekday = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - weekday);
  return copy;
}

export function daysBetween(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return Math.round((b - a) / 86_400_000);
}

/* ------------------------------------------------------------ formatting */

/** `km` has no widely-installed RN date pattern, so Khmer falls back to en-GB. */
function intlLocale(language: string): string {
  return language === 'km' ? 'km-KH' : 'en-US';
}

function safeFormat(date: Date, language: string, options: Intl.DateTimeFormatOptions): string {
  try {
    return new Intl.DateTimeFormat(intlLocale(language), options).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }
}

export function formatFullDate(date: Date, language = 'en'): string {
  return safeFormat(date, language, { weekday: 'long', month: 'long', day: 'numeric' });
}

export function formatMediumDate(date: Date, language = 'en'): string {
  return safeFormat(date, language, { month: 'long', day: 'numeric', year: 'numeric' });
}

export function formatMonth(key: string, language = 'en'): string {
  const [year, month] = key.split('-').map(Number);
  return safeFormat(new Date(year, month - 1, 1), language, { month: 'long', year: 'numeric' });
}

/**
 * Abbreviated month for chart axes. Uses the locale's own short form rather
 * than slicing the long one: Khmer months are single words whose combining
 * marks break apart when cut ("កញ្ញា" sliced to three units leaves a dangling
 * coeng), and Intl already knows the right abbreviation for each locale.
 */
export function formatMonthShort(key: string, language = 'en'): string {
  const [year, month] = key.split('-').map(Number);
  return safeFormat(new Date(year, month - 1, 1), language, { month: 'short' });
}

export function formatWeekdayShort(date: Date, language = 'en'): string {
  return safeFormat(date, language, { weekday: 'short' });
}

/**
 * Date headings in lists: "Today" / "Yesterday" beat a raw date for recent
 * entries, which is nearly all of them.
 */
export function formatDateHeading(
  iso: ISODate,
  language: string,
  labels: { today: string; yesterday: string }
): string {
  const date = fromISODate(iso);
  const offset = daysBetween(new Date(), date);
  if (offset === 0) return labels.today;
  if (offset === -1) return labels.yesterday;

  const sameYear = date.getFullYear() === new Date().getFullYear();
  return safeFormat(date, language, {
    month: 'long',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

export function formatRelativeTimestamp(
  isoDateTime: string,
  language: string,
  labels: { today: string; yesterday: string }
): string {
  const date = new Date(isoDateTime);
  const offset = daysBetween(new Date(), date);
  if (offset === 0) return safeFormat(date, language, { hour: 'numeric', minute: '2-digit' });
  if (offset === -1) return labels.yesterday;
  return safeFormat(date, language, { month: 'short', day: 'numeric' });
}

/** 0 = midnight … 11 = late evening. Drives the Home greeting. */
export function timeOfDay(date = new Date()): 'morning' | 'afternoon' | 'evening' {
  const hour = date.getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}
