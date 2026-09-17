import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Divider } from '@/components/ui/divider';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { usePreferences, useT } from '@/features/settings/store';
import { useTheme } from '@/hooks/use-theme';
import { formatClock, formatDateHeading, todayISO } from '@/lib/date';
import type { Task } from '@/types';

import { usePriorityColor } from './task-row';
import type { TaskProgress } from '../selectors';

export interface HomeTasksProps {
  tasks: Task[];
  progress: TaskProgress;
  onToggle: (task: Task) => void;
  onSelect: (task: Task) => void;
  onCreate: () => void;
}

/** Today's tasks, condensed for the dashboard: tick-off only, no swipe actions. */
export function HomeTasks({ tasks, progress, onToggle, onSelect, onCreate }: HomeTasksProps) {
  const theme = useTheme();
  const t = useT();
  const { preferences } = usePreferences();
  const priorityColor = usePriorityColor();

  if (tasks.length === 0) {
    return (
      <Card>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={t('tasks.newTask')}
          onPress={onCreate}
          style={styles.empty}>
          <Icon name="checkmark-done-outline" size={22} color="income" />
          <Text variant="body" color="textSecondary">
            {t('tasks.emptyToday')}
          </Text>
        </PressableScale>
      </Card>
    );
  }

  /** A reminder due today reads better as a time; anything else as its day. */
  const meta = (task: Task) => {
    if (task.reminderAt && task.reminderAt.slice(0, 10) === todayISO()) {
      return formatClock(new Date(task.reminderAt), preferences.language, preferences.timeFormat);
    }

    if (!task.dueDate) return undefined;

    return formatDateHeading(task.dueDate, preferences.language, {
      today: t('common.today'),
      yesterday: t('common.yesterday'),
    });
  };

  return (
    <Card style={styles.card}>
      <View style={styles.progress}>
        <ProgressBar
          value={progress.total > 0 ? progress.done / progress.total : 0}
          height={6}
          accessibilityLabel={t('tasks.progress', { done: progress.done, total: progress.total })}
        />
        <Text variant="caption" color="textSecondary">
          {t('tasks.progress', { done: progress.done, total: progress.total })}
        </Text>
      </View>

      {tasks.map((task, index) => {
        const label = meta(task);

        return (
          <Fragment key={task.id}>
            {index > 0 ? <Divider inset={38} /> : null}

            <View style={styles.row}>
              <Checkbox
                checked={task.completed}
                onToggle={() => onToggle(task)}
                size={22}
                tint={theme.primary}
                accessibilityLabel={task.completed ? t('tasks.uncomplete') : t('tasks.complete')}
              />

              <PressableScale
                accessibilityRole="button"
                accessibilityLabel={task.title}
                onPress={() => onSelect(task)}
                scaleTo={0.99}
                style={styles.titleWrap}>
                <Text
                  variant="body"
                  color={task.completed ? 'textTertiary' : 'text'}
                  numberOfLines={1}
                  style={task.completed && styles.done}>
                  {task.title}
                </Text>
              </PressableScale>

              {label ? (
                <Text variant="caption" color="textTertiary" numberOfLines={1}>
                  {label}
                </Text>
              ) : null}

              <View style={[styles.priority, { backgroundColor: priorityColor(task.priority) }]} />
            </View>
          </Fragment>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: Spacing.md, gap: Spacing.xs },
  progress: { gap: Spacing.xs, paddingBottom: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  titleWrap: { flex: 1 },
  done: { textDecorationLine: 'line-through' },
  priority: { width: 7, height: 7, borderRadius: Radius.pill },
  empty: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs },
});
