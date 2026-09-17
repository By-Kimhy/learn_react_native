import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { confirm } from '@/components/ui/confirm';
import { EmptyState } from '@/components/ui/empty-state';
import { ProgressBar } from '@/components/ui/progress-bar';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { clearReminder } from '@/features/reminders/scheduler';
import { useT } from '@/features/settings/store';
import { TaskList } from '@/features/tasks/components/task-list';
import { bucketTasks, todayProgress } from '@/features/tasks/selectors';
import { useTasks } from '@/features/tasks/store';
import { useTheme } from '@/hooks/use-theme';
import type { Task } from '@/types';

type Bucket = 'today' | 'upcoming' | 'completed';

export default function TasksScreen() {
  const router = useRouter();
  const theme = useTheme();
  const t = useT();
  const { tasks, toggleTask, updateTask, deleteTask, clearCompleted } = useTasks();

  const [bucket, setBucket] = useState<Bucket>('today');

  const buckets = useMemo(() => bucketTasks(tasks), [tasks]);
  const progress = useMemo(() => todayProgress(tasks), [tasks]);

  const visible = buckets[bucket];

  /** Completing a task makes its pending reminder pointless, so cancel it too. */
  const handleToggle = async (task: Task) => {
    toggleTask(task.id);

    const isCompleting = !task.completed;
    if (isCompleting && task.notificationId) {
      await clearReminder(task.notificationId);
      // Clear the stored id as well, so it can never be cancelled twice.
      updateTask(task.id, { notificationId: undefined });
    }
  };

  const handleDelete = async (task: Task) => {
    const confirmed = await confirm({
      title: t('tasks.deleteTitle'),
      message: t('tasks.deleteBody'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (!confirmed) return;

    await clearReminder(task.notificationId);
    deleteTask(task.id);
  };

  const handleClearCompleted = async () => {
    const confirmed = await confirm({
      title: t('tasks.clearCompletedTitle'),
      message: t('tasks.clearCompletedBody'),
      confirmLabel: t('tasks.clearCompleted'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (!confirmed) return;

    const removed = clearCompleted();
    await Promise.all(removed.map((task) => clearReminder(task.notificationId)));
  };

  const emptyFor: Record<Bucket, { title: string; body: string }> = {
    today: { title: t('tasks.emptyToday'), body: t('tasks.emptyTodayBody') },
    upcoming: { title: t('tasks.emptyUpcoming'), body: t('tasks.emptyUpcomingBody') },
    completed: { title: t('tasks.emptyCompleted'), body: t('tasks.emptyCompletedBody') },
  };

  return (
    <>
      <ScreenHeader
        title={t('tasks.title')}
        onBack={() => router.back()}
        right={
          <>
            {buckets.completed.length > 0 ? (
              <IconButton
                name="trash-outline"
                accessibilityLabel={t('tasks.clearCompleted')}
                onPress={handleClearCompleted}
              />
            ) : null}
            <IconButton
              name="add"
              accessibilityLabel={t('tasks.newTask')}
              onPress={() => router.push('/task/new')}
            />
          </>
        }
      />

      <Screen contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <SegmentedControl
            accessibilityLabel={t('tasks.title')}
            options={[
              { value: 'today', label: t('tasks.today') },
              { value: 'upcoming', label: t('tasks.upcoming') },
              { value: 'completed', label: t('tasks.completed') },
            ]}
            value={bucket}
            onChange={setBucket}
          />

          {progress.total > 0 ? (
            <Card style={styles.progressCard}>
              <View style={styles.progressHead}>
                <Text variant="bodyStrong" numberOfLines={1} style={styles.progressLabel}>
                  {t('tasks.progress', { done: progress.done, total: progress.total })}
                </Text>
                <Badge
                  label={`${Math.round((progress.done / progress.total) * 100)}%`}
                  tone={progress.done === progress.total ? 'green' : 'blue'}
                />
              </View>

              <ProgressBar
                value={progress.done / progress.total}
                tint={progress.done === progress.total ? theme.income : theme.primary}
              />
            </Card>
          ) : null}
        </View>

        {visible.length > 0 ? (
          <TaskList
            tasks={visible}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onSelect={(task) => router.push(`/task/${task.id}`)}
          />
        ) : (
          <EmptyState
            icon={bucket === 'completed' ? 'checkmark-done-outline' : 'checkbox-outline'}
            title={emptyFor[bucket].title}
            body={emptyFor[bucket].body}
            action={
              bucket === 'completed'
                ? undefined
                : { label: t('tasks.newTask'), icon: 'add', onPress: () => router.push('/task/new') }
            }
          />
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: Spacing.lg },
  header: { gap: Spacing.md, marginBottom: Spacing.lg },
  progressCard: { gap: Spacing.sm, padding: Spacing.lg },
  progressHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  progressLabel: { flex: 1 },
});
