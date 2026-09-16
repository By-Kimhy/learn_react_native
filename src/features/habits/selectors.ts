import { startOfWeek, toISODate, todayISO } from '@/lib/date';
import type { Habit, HabitCompletion, ISODate } from '@/types';

/** Set of the dates a habit was completed on — O(1) lookups for the grids. */
export function completionSet(completions: HabitCompletion[], habitId: string): Set<ISODate> {
  const dates = new Set<ISODate>();
  for (const completion of completions) {
    if (completion.habitId === habitId) dates.add(completion.date);
  }
  return dates;
}

function shift(iso: ISODate, days: number): ISODate {
  const [year, month, day] = iso.split('-').map(Number);
  return toISODate(new Date(year, month - 1, day + days));
}

/**
 * Days completed in an unbroken run ending today.
 *
 * Not having ticked *today* yet doesn't break a streak — the day isn't over.
 * So the count starts at yesterday unless today is already done.
 */
export function currentStreak(dates: Set<ISODate>, today: ISODate = todayISO()): number {
  let streak = 0;
  let cursor = dates.has(today) ? today : shift(today, -1);

  while (dates.has(cursor)) {
    streak += 1;
    cursor = shift(cursor, -1);
  }

  return streak;
}

/** The longest unbroken run anywhere in the habit's history. */
export function longestStreak(dates: Set<ISODate>): number {
  if (dates.size === 0) return 0;

  const sorted = [...dates].sort();
  let best = 1;
  let run = 1;

  for (let index = 1; index < sorted.length; index += 1) {
    if (sorted[index] === shift(sorted[index - 1], 1)) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }

  return best;
}

export interface WeekDay {
  date: ISODate;
  done: boolean;
  /** Future days render as placeholders — they can't be ticked yet. */
  isFuture: boolean;
  isToday: boolean;
}

/** Monday-first week containing `reference`, for the habit card's day row. */
export function weekDays(dates: Set<ISODate>, reference = new Date()): WeekDay[] {
  const start = startOfWeek(reference);
  const today = todayISO();

  return Array.from({ length: 7 }, (_, offset) => {
    const date = toISODate(
      new Date(start.getFullYear(), start.getMonth(), start.getDate() + offset)
    );
    return { date, done: dates.has(date), isFuture: date > today, isToday: date === today };
  });
}

/** How many of this week's days are done, against the habit's own target. */
export function weeklyProgress(
  habit: Habit,
  dates: Set<ISODate>,
  reference = new Date()
): { done: number; target: number } {
  const done = weekDays(dates, reference).filter((day) => day.done).length;
  return { done, target: habit.frequency === 'daily' ? 7 : habit.timesPerWeek };
}

/** Across all habits: how many are ticked today. Drives the Home summary. */
export function todayHabitProgress(
  habits: Habit[],
  completions: HabitCompletion[],
  today: ISODate = todayISO()
): { done: number; total: number } {
  const doneToday = new Set(
    completions.filter((completion) => completion.date === today).map((c) => c.habitId)
  );

  return {
    done: habits.filter((habit) => doneToday.has(habit.id)).length,
    total: habits.length,
  };
}

/** The best current streak across all habits — the number Home shows. */
export function bestCurrentStreak(habits: Habit[], completions: HabitCompletion[]): number {
  let best = 0;
  for (const habit of habits) {
    best = Math.max(best, currentStreak(completionSet(completions, habit.id)));
  }
  return best;
}
