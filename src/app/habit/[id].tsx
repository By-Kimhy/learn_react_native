import { useLocalSearchParams, useRouter } from 'expo-router';

import { notify } from '@/components/ui/confirm';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { HabitForm, type HabitFormValues } from '@/features/habits/components/habit-form';
import { completionSet, currentStreak, longestStreak } from '@/features/habits/selectors';
import { useHabits } from '@/features/habits/store';
import { clearReminder, syncDailyReminder } from '@/features/reminders/scheduler';
import { usePreferences, useT } from '@/features/settings/store';

export default function HabitEditorScreen() {
  const router = useRouter();
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { preferences } = usePreferences();
  const { getHabit, addHabit, updateHabit, deleteHabit, completions } = useHabits();

  const isNew = id === 'new';
  const habit = isNew ? undefined : getHabit(id);

  if (!isNew && !habit) {
    return (
      <>
        <ScreenHeader title={t('common.error')} onBack={() => router.back()} />
        <Screen>
          <EmptyState icon="alert-circle-outline" title={t('habits.empty')} body={t('habits.emptyBody')} />
        </Screen>
      </>
    );
  }

  const dates = habit ? completionSet(completions, habit.id) : new Set<string>();

  const handleSubmit = async (values: HabitFormValues) => {
    const fields = {
      name: values.name,
      emoji: values.emoji,
      frequency: values.frequency,
      timesPerWeek: values.timesPerWeek,
      reminderTime: values.reminderTime,
    };

    let savedId: string;
    if (habit) {
      updateHabit(habit.id, fields);
      savedId = habit.id;
    } else {
      savedId = addHabit(fields).id;
    }

    router.back();

    // Habit reminders repeat daily even for weekly habits: a nudge on a day you
    // have already done it is harmless, a missed nudge is not.
    const notificationId = await syncDailyReminder({
      previousNotificationId: habit?.notificationId,
      enabled: preferences.notificationsEnabled,
      time: values.reminderTime,
      title: `${values.emoji} ${values.name}`,
      body: t('habits.markDone'),
      data: { type: 'habit', id: savedId },
    });

    updateHabit(savedId, { notificationId });

    // A reminder the OS refused would otherwise sit in the list looking armed:
    // `collectReminders` reads `reminderAt`, not the notification id. Say so
    // instead of failing quietly.
    if (values.reminderTime && preferences.notificationsEnabled && !notificationId) {
      notify(t('reminders.notScheduledTitle'), t('reminders.notScheduledBody'));
    }
  };

  const handleDelete = async () => {
    if (!habit) return;
    router.back();
    await clearReminder(habit.notificationId);
    deleteHabit(habit.id);
  };

  return (
    <HabitForm
      mode={isNew ? 'create' : 'edit'}
      initialValues={
        habit
          ? {
              name: habit.name,
              emoji: habit.emoji,
              frequency: habit.frequency,
              timesPerWeek: habit.timesPerWeek,
              reminderTime: habit.reminderTime,
            }
          : undefined
      }
      stats={
        habit
          ? { current: currentStreak(dates), longest: longestStreak(dates), total: dates.size }
          : undefined
      }
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      onDelete={habit ? handleDelete : undefined}
    />
  );
}
