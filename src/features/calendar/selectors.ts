import { fromISODate, toISODate, todayISO } from '@/lib/date';
import type { CalendarEvent, ISODate } from '@/types';

/**
 * A repeating event is stored once and expanded on read. That keeps the data
 * small and means editing the series edits every occurrence, which is the
 * behaviour a simple personal calendar wants.
 */
export interface EventOccurrence {
  event: CalendarEvent;
  date: ISODate;
  /** False for the stored event itself, true for a generated repeat. */
  isRepeat: boolean;
}

function occursOn(event: CalendarEvent, date: ISODate): boolean {
  if (event.date === date) return true;
  if (event.repeat === 'none') return false;
  // Repeats only run forward from the original date.
  if (date < event.date) return false;

  const start = fromISODate(event.date);
  const target = fromISODate(date);

  switch (event.repeat) {
    case 'daily':
      return true;
    case 'weekly':
      return start.getDay() === target.getDay();
    case 'monthly':
      return start.getDate() === target.getDate();
    case 'yearly':
      return start.getDate() === target.getDate() && start.getMonth() === target.getMonth();
    default:
      return false;
  }
}

export function eventsOn(events: CalendarEvent[], date: ISODate): EventOccurrence[] {
  return events
    .filter((event) => occursOn(event, date))
    .map((event) => ({ event, date, isRepeat: event.date !== date }))
    .sort((a, b) => (a.event.time ?? '').localeCompare(b.event.time ?? ''));
}

/** Which days in a range have at least one event — drives the month grid dots. */
export function daysWithEvents(events: CalendarEvent[], from: ISODate, to: ISODate): Set<ISODate> {
  const days = new Set<ISODate>();
  const cursor = fromISODate(from);
  const end = fromISODate(to);

  while (cursor <= end) {
    const iso = toISODate(cursor);
    if (events.some((event) => occursOn(event, iso))) days.add(iso);
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

/** The next `limit` occurrences from today onwards, scanning `days` ahead. */
export function upcomingOccurrences(
  events: CalendarEvent[],
  limit = 5,
  days = 60,
  today: ISODate = todayISO()
): EventOccurrence[] {
  const found: EventOccurrence[] = [];
  const cursor = fromISODate(today);

  for (let offset = 0; offset < days && found.length < limit; offset += 1) {
    const iso = toISODate(cursor);
    found.push(...eventsOn(events, iso));
    cursor.setDate(cursor.getDate() + 1);
  }

  return found.slice(0, limit);
}

export interface MonthCell {
  date: ISODate;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  hasEvents: boolean;
}

/** A Monday-first 6×7 grid covering `monthKey`, padded with adjacent days. */
export function monthGrid(monthKey: string, withEvents: Set<ISODate>): MonthCell[] {
  const [year, month] = monthKey.split('-').map(Number);
  const first = new Date(year, month - 1, 1);
  const leading = (first.getDay() + 6) % 7;
  const start = new Date(year, month - 1, 1 - leading);
  const today = todayISO();

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
    const iso = toISODate(date);
    return {
      date: iso,
      day: date.getDate(),
      inMonth: date.getMonth() === month - 1,
      isToday: iso === today,
      hasEvents: withEvents.has(iso),
    };
  });
}
