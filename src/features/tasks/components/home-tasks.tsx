import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Divider } from '@/components/ui/divider';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useT } from '@/features/settings/store';
import { useTheme } from '@/hooks/use-theme';
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

  return (
    <Card style={styles.card}>
      {tasks.map((task, index) => (
        <Fragment key={task.id}>
          {index > 0 ? <Divider inset={38} /> : null}

          <View style={styles.row}>
            <Checkbox
              checked={task.completed}
              onToggle={() => onToggle(task)}
              size={22}
              tint={priorityColor(task.priority)}
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
          </View>
        </Fragment>
      ))}

      <View style={styles.progress}>
        <View style={[styles.track, { backgroundColor: theme.surfaceAlt }]}>
          <View
            style={[
              styles.fill,
              {
                width: `${progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0}%`,
                backgroundColor: theme.income,
              },
            ]}
          />
        </View>
        <Text variant="caption" color="textSecondary">
          {t('tasks.progress', { done: progress.done, total: progress.total })}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: Spacing.sm, gap: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  titleWrap: { flex: 1 },
  done: { textDecorationLine: 'line-through' },
  empty: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs },
  progress: { gap: Spacing.xs, paddingTop: Spacing.xs },
  track: { height: 5, borderRadius: Radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radius.pill },
});
