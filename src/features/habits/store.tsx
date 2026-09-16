import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';

import { todayISO } from '@/lib/date';
import { createId } from '@/lib/id';
import { StorageKeys } from '@/lib/storage';
import { usePersistedState } from '@/store/use-persisted-state';
import type { Habit, HabitCompletion, ISODate } from '@/types';

/** Module scope so the persisted-state load effects have stable dependencies. */
const NO_HABITS: Habit[] = [];
const NO_COMPLETIONS: HabitCompletion[] = [];

function hydrateHabits(raw: unknown): Habit[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item): item is Partial<Habit> => typeof item === 'object' && item !== null)
    .filter((item) => typeof item.id === 'string' && typeof item.name === 'string')
    .map(
      (item): Habit => ({
        id: item.id!,
        name: item.name!,
        emoji: item.emoji ?? '🔥',
        frequency: item.frequency === 'weekly' ? 'weekly' : 'daily',
        timesPerWeek: typeof item.timesPerWeek === 'number' ? item.timesPerWeek : 7,
        reminderTime: item.reminderTime,
        notificationId: item.notificationId,
        archived: Boolean(item.archived),
        createdAt: item.createdAt ?? new Date().toISOString(),
        updatedAt: item.updatedAt ?? item.createdAt ?? new Date().toISOString(),
      })
    );
}

function hydrateCompletions(raw: unknown): HabitCompletion[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item): item is Partial<HabitCompletion> => typeof item === 'object' && item !== null)
    .filter((item) => typeof item.habitId === 'string' && typeof item.date === 'string')
    .map((item) => ({
      id: item.id ?? createId('hc'),
      habitId: item.habitId!,
      date: item.date!,
      createdAt: item.createdAt ?? new Date().toISOString(),
    }));
}

export type HabitDraft = Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'archived'>;
export type HabitChanges = Partial<Omit<Habit, 'id' | 'createdAt'>>;

interface HabitsValue {
  habits: Habit[];
  completions: HabitCompletion[];
  ready: boolean;
  activeHabits: Habit[];
  getHabit: (id: string) => Habit | undefined;
  addHabit: (draft: HabitDraft) => Habit;
  updateHabit: (id: string, changes: HabitChanges) => void;
  deleteHabit: (id: string) => void;
  isDone: (habitId: string, date?: ISODate) => boolean;
  toggleCompletion: (habitId: string, date?: ISODate) => void;
  completionsFor: (habitId: string) => HabitCompletion[];
}

const HabitsContext = createContext<HabitsValue | null>(null);

export function HabitsProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits, habitsReady] = usePersistedState<Habit[]>({
    key: StorageKeys.habits,
    initial: NO_HABITS,
    hydrate: hydrateHabits,
  });

  const [completions, setCompletions, completionsReady] = usePersistedState<HabitCompletion[]>({
    key: StorageKeys.habitCompletions,
    initial: NO_COMPLETIONS,
    hydrate: hydrateCompletions,
  });

  const getHabit = useCallback((id: string) => habits.find((habit) => habit.id === id), [habits]);

  const addHabit = useCallback(
    (draft: HabitDraft) => {
      const now = new Date().toISOString();
      const habit: Habit = { ...draft, id: createId('habit'), archived: false, createdAt: now, updatedAt: now };
      setHabits((current) => [...current, habit]);
      return habit;
    },
    [setHabits]
  );

  const updateHabit = useCallback(
    (id: string, changes: HabitChanges) => {
      setHabits((current) =>
        current.map((habit) =>
          habit.id === id ? { ...habit, ...changes, updatedAt: new Date().toISOString() } : habit
        )
      );
    },
    [setHabits]
  );

  /** Deleting a habit takes its history with it — orphan rows would skew stats. */
  const deleteHabit = useCallback(
    (id: string) => {
      setHabits((current) => current.filter((habit) => habit.id !== id));
      setCompletions((current) => current.filter((completion) => completion.habitId !== id));
    },
    [setHabits, setCompletions]
  );

  /** Completion is a set membership test: one row per habit per day, or none. */
  const isDone = useCallback(
    (habitId: string, date: ISODate = todayISO()) =>
      completions.some((completion) => completion.habitId === habitId && completion.date === date),
    [completions]
  );

  const toggleCompletion = useCallback(
    (habitId: string, date: ISODate = todayISO()) => {
      setCompletions((current) => {
        const exists = current.some(
          (completion) => completion.habitId === habitId && completion.date === date
        );

        if (exists) {
          return current.filter(
            (completion) => !(completion.habitId === habitId && completion.date === date)
          );
        }

        return [
          ...current,
          { id: createId('hc'), habitId, date, createdAt: new Date().toISOString() },
        ];
      });
    },
    [setCompletions]
  );

  const completionsFor = useCallback(
    (habitId: string) => completions.filter((completion) => completion.habitId === habitId),
    [completions]
  );

  const activeHabits = useMemo(() => habits.filter((habit) => !habit.archived), [habits]);

  const value = useMemo(
    () => ({
      habits,
      completions,
      ready: habitsReady && completionsReady,
      activeHabits,
      getHabit,
      addHabit,
      updateHabit,
      deleteHabit,
      isDone,
      toggleCompletion,
      completionsFor,
    }),
    [
      habits,
      completions,
      habitsReady,
      completionsReady,
      activeHabits,
      getHabit,
      addHabit,
      updateHabit,
      deleteHabit,
      isDone,
      toggleCompletion,
      completionsFor,
    ]
  );

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabits(): HabitsValue {
  const value = useContext(HabitsContext);
  if (!value) throw new Error('useHabits must be used inside <HabitsProvider>');
  return value;
}
