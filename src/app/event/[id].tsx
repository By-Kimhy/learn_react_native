import { useLocalSearchParams, useRouter } from 'expo-router';

import { notify } from '@/components/ui/confirm';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { EventForm, type EventFormValues } from '@/features/calendar/components/event-form';
import { useEvents } from '@/features/calendar/store';
import { clearReminder, reminderInstant, syncOnceReminder } from '@/features/reminders/scheduler';
import { usePreferences, useT } from '@/features/settings/store';
import { todayISO } from '@/lib/date';

export default function EventEditorScreen() {
  const router = useRouter();
  const t = useT();
  const { id, date, reminder } = useLocalSearchParams<{
    id: string;
    date?: string;
    reminder?: string;
  }>();
  const { preferences } = usePreferences();
  const { getEvent, addEvent, updateEvent, deleteEvent } = useEvents();

  const isNew = id === 'new';
  const event = isNew ? undefined : getEvent(id);

  if (!isNew && !event) {
    return (
      <>
        <ScreenHeader title={t('common.error')} onBack={() => router.back()} />
        <Screen>
          <EmptyState
            icon="alert-circle-outline"
            title={t('calendar.noEvents')}
            body={t('calendar.noEventsBody')}
          />
        </Screen>
      </>
    );
  }

  const handleSubmit = async (values: EventFormValues) => {
    const fields = {
      title: values.title,
      date: values.date,
      time: values.time,
      description: values.description || undefined,
      repeat: values.repeat,
      reminderMinutesBefore: values.reminderMinutesBefore,
    };

    let savedId: string;
    if (event) {
      updateEvent(event.id, fields);
      savedId = event.id;
    } else {
      savedId = addEvent(fields).id;
    }

    router.back();

    // Only the next occurrence is scheduled. Repeats are expanded on read, so
    // scheduling the whole series would mean hundreds of pending notifications.
    const fireAt = reminderInstant(values.date, values.time, values.reminderMinutesBefore);

    const notificationId = await syncOnceReminder({
      previousNotificationId: event?.notificationId,
      enabled: preferences.notificationsEnabled,
      fireAt,
      title: values.title,
      body: values.description || undefined,
      data: { type: 'event', id: savedId },
    });

    updateEvent(savedId, { notificationId });

    // A reminder the OS refused would otherwise sit in the list looking armed:
    // `collectReminders` reads `reminderAt`, not the notification id. Say so
    // instead of failing quietly.
    if (fireAt && preferences.notificationsEnabled && !notificationId) {
      notify(t('reminders.notScheduledTitle'), t('reminders.notScheduledBody'));
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    router.back();
    await clearReminder(event.notificationId);
    deleteEvent(event.id);
  };

  return (
    <EventForm
      mode={isNew ? 'create' : 'edit'}
      initialValues={
        event
          ? {
              title: event.title,
              date: event.date,
              time: event.time,
              description: event.description ?? '',
              repeat: event.repeat,
              reminderMinutesBefore: event.reminderMinutesBefore,
            }
          : {
              date: date ?? todayISO(),
              // Reached via "New Reminder", which implies a timed, alerting event.
              time: reminder ? '09:00' : undefined,
              reminderMinutesBefore: reminder ? 0 : undefined,
            }
      }
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      onDelete={event ? handleDelete : undefined}
    />
  );
}
