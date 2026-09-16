import { useLocalSearchParams, useRouter } from 'expo-router';

import { notify } from '@/components/ui/confirm';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { clearReminder, combineDateTime, syncOnceReminder, toTimeString } from '@/features/reminders/scheduler';
import { usePreferences, useT } from '@/features/settings/store';
import { TaskForm, type TaskFormValues } from '@/features/tasks/components/task-form';
import { useTasks } from '@/features/tasks/store';

export default function TaskEditorScreen() {
  const router = useRouter();
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { preferences } = usePreferences();
  const { getTask, addTask, updateTask, deleteTask } = useTasks();

  const isNew = id === 'new';
  const task = isNew ? undefined : getTask(id);

  if (!isNew && !task) {
    return (
      <>
        <ScreenHeader title={t('common.error')} onBack={() => router.back()} />
        <Screen>
          <EmptyState
            icon="alert-circle-outline"
            title={t('tasks.emptyCompleted')}
            body={t('tasks.emptyCompletedBody')}
          />
        </Screen>
      </>
    );
  }

  /**
   * Saving is: persist the task, then reconcile its notification and write the
   * resulting id back. The reminder work is async, so the screen closes first
   * and the id lands a moment later — the user never waits on the OS.
   */
  const handleSubmit = async (values: TaskFormValues) => {
    const reminderAt =
      values.dueDate && values.reminderTime
        ? combineDateTime(values.dueDate, values.reminderTime).toISOString()
        : undefined;

    const fields = {
      title: values.title,
      description: values.description || undefined,
      dueDate: values.dueDate,
      priority: values.priority,
      reminderAt,
    };

    let savedId: string;
    if (task) {
      updateTask(task.id, fields);
      savedId = task.id;
    } else {
      savedId = addTask(fields).id;
    }

    router.back();

    const notificationId = await syncOnceReminder({
      previousNotificationId: task?.notificationId,
      enabled: preferences.notificationsEnabled,
      fireAt: reminderAt ? new Date(reminderAt) : null,
      title: values.title,
      body: values.description || undefined,
      data: { type: 'task', id: savedId },
    });

    updateTask(savedId, { notificationId });

    // A reminder the OS refused would otherwise sit in the list looking armed:
    // `collectReminders` reads `reminderAt`, not the notification id. Say so
    // instead of failing quietly.
    if (reminderAt && preferences.notificationsEnabled && !notificationId) {
      notify(t('reminders.notScheduledTitle'), t('reminders.notScheduledBody'));
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    router.back();
    await clearReminder(task.notificationId);
    deleteTask(task.id);
  };

  return (
    <TaskForm
      mode={isNew ? 'create' : 'edit'}
      initialValues={
        task
          ? {
              title: task.title,
              description: task.description ?? '',
              dueDate: task.dueDate,
              priority: task.priority,
              reminderTime: task.reminderAt ? toTimeString(new Date(task.reminderAt)) : undefined,
            }
          : undefined
      }
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      onDelete={task ? handleDelete : undefined}
    />
  );
}
