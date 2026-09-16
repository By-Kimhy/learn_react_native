import { combineDateTime, reminderInstant } from '@/features/reminders/scheduler';
import type { CalendarEvent, Habit, Task } from '@/types';

export type ReminderSource = 'task' | 'event' | 'habit';

export interface ReminderEntry {
  id: string;
  source: ReminderSource;
  /** Id of the task/event/habit this came from, for navigation. */
  sourceId: string;
  title: string;
  subtitle?: string;
  /** Absolute instant, or null for a repeating daily habit reminder. */
  fireAt: Date | null;
  /** Local `HH:mm` — what a daily habit reminder has instead of an instant. */
  dailyTime?: string;
  emoji?: string;
}

/**
 * One list across every feature that can remind you. This is what makes the
 * Reminders screen feel like part of one app rather than three separate ones.
 */
export function collectReminders({
  tasks,
  events,
  habits,
}: {
  tasks: Task[];
  events: CalendarEvent[];
  habits: Habit[];
}): ReminderEntry[] {
  const entries: ReminderEntry[] = [];

  for (const task of tasks) {
    // A finished task's reminder is already cancelled; don't list it either.
    if (task.completed || !task.reminderAt) continue;
    entries.push({
      id: `task-${task.id}`,
      source: 'task',
      sourceId: task.id,
      title: task.title,
      subtitle: task.description,
      fireAt: new Date(task.reminderAt),
    });
  }

  for (const event of events) {
    if (event.reminderMinutesBefore === undefined) continue;
    entries.push({
      id: `event-${event.id}`,
      source: 'event',
      sourceId: event.id,
      title: event.title,
      subtitle: event.description,
      fireAt: reminderInstant(event.date, event.time, event.reminderMinutesBefore),
    });
  }

  for (const habit of habits) {
    if (!habit.reminderTime) continue;
    entries.push({
      id: `habit-${habit.id}`,
      source: 'habit',
      sourceId: habit.id,
      title: habit.name,
      fireAt: null,
      dailyTime: habit.reminderTime,
      emoji: habit.emoji,
    });
  }

  return sortReminders(entries);
}

/**
 * Soonest first. Daily habit reminders have no single instant, so they are
 * ordered by their next occurrence today or tomorrow.
 */
function sortReminders(entries: ReminderEntry[]): ReminderEntry[] {
  const now = Date.now();

  const keyOf = (entry: ReminderEntry): number => {
    if (entry.fireAt) return entry.fireAt.getTime();
    if (!entry.dailyTime) return Number.MAX_SAFE_INTEGER;

    const today = new Date();
    const iso = `${today.getFullYear()}-${`${today.getMonth() + 1}`.padStart(2, '0')}-${`${today.getDate()}`.padStart(2, '0')}`;
    const next = combineDateTime(iso, entry.dailyTime).getTime();
    return next >= now ? next : next + 86_400_000;
  };

  return [...entries].sort((a, b) => keyOf(a) - keyOf(b));
}

/** Entries whose instant has already passed — shown dimmed, not hidden. */
export function isPast(entry: ReminderEntry, now = Date.now()): boolean {
  return entry.fireAt !== null && entry.fireAt.getTime() < now;
}
