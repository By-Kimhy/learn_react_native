import type { ReminderOffset } from '@/types';

import { cancel, ensurePermission, scheduleDaily, scheduleOnce } from './notifications';

/**
 * The single entry point features use to keep a reminder in sync with its
 * entity. Callers hand over the previous notification id and the new intent;
 * they get back the id to persist (or `undefined` when nothing is scheduled).
 */

export interface SyncOnceParams {
  /** Id stored on the entity from the last time it was scheduled. */
  previousNotificationId?: string;
  /** The user's global notifications toggle. */
  enabled: boolean;
  /** When to fire, or `null` to just clear the existing reminder. */
  fireAt: Date | null;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
}

export async function syncOnceReminder({
  previousNotificationId,
  enabled,
  fireAt,
  title,
  body,
  data,
}: SyncOnceParams): Promise<string | undefined> {
  // Always clear first: rescheduling is "cancel then create", and clearing a
  // reminder is the same path with `fireAt: null`.
  await cancel(previousNotificationId);

  if (!enabled || !fireAt) return undefined;
  if (!(await ensurePermission())) return undefined;

  return scheduleOnce({ title, body, fireAt, data });
}

export interface SyncDailyParams {
  previousNotificationId?: string;
  enabled: boolean;
  /** Local `HH:mm`, or `undefined` to clear. */
  time?: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
}

export async function syncDailyReminder({
  previousNotificationId,
  enabled,
  time,
  title,
  body,
  data,
}: SyncDailyParams): Promise<string | undefined> {
  await cancel(previousNotificationId);

  if (!enabled || !time) return undefined;

  const parsed = parseTime(time);
  if (!parsed) return undefined;
  if (!(await ensurePermission())) return undefined;

  return scheduleDaily({ title, body, hour: parsed.hour, minute: parsed.minute, data });
}

export async function clearReminder(notificationId: string | undefined): Promise<void> {
  await cancel(notificationId);
}

/* ------------------------------------------------------------- time utils */

export function parseTime(time: string): { hour: number; minute: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  return { hour, minute };
}

export function formatTime(time: string, language = 'en'): string {
  const parsed = parseTime(time);
  if (!parsed) return time;

  const date = new Date(2000, 0, 1, parsed.hour, parsed.minute);
  try {
    return new Intl.DateTimeFormat(language === 'km' ? 'km-KH' : 'en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  } catch {
    return time;
  }
}

export function toTimeString(date: Date): string {
  return `${`${date.getHours()}`.padStart(2, '0')}:${`${date.getMinutes()}`.padStart(2, '0')}`;
}

/** Combines a `YYYY-MM-DD` day with an optional `HH:mm` into a local Date. */
export function combineDateTime(date: string, time?: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  const parsed = time ? parseTime(time) : null;
  return new Date(year, (month ?? 1) - 1, day ?? 1, parsed?.hour ?? 9, parsed?.minute ?? 0);
}

/** Event reminders are expressed as "n minutes before"; this resolves the instant. */
export function reminderInstant(
  date: string,
  time: string | undefined,
  offsetMinutes: ReminderOffset | undefined
): Date | null {
  if (offsetMinutes === undefined) return null;
  const base = combineDateTime(date, time);
  return new Date(base.getTime() - offsetMinutes * 60_000);
}
