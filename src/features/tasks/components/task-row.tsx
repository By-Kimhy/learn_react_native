import { StyleSheet, View } from 'react-native';

import { Checkbox } from '@/components/ui/checkbox';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { usePreferences, useT } from '@/features/settings/store';
import { useTheme } from '@/hooks/use-theme';
import { formatDateHeading, fromISODate } from '@/lib/date';
import type { Priority, Task } from '@/types';

import { isOverdue } from '../selectors';

/** Priority reads as a colour on the checkbox, not as another badge. */
export function usePriorityColor(): (priority: Priority) => string {
  const theme = useTheme();
  return (priority) =>
    priority === 'high' ? theme.expense : priority === 'medium' ? theme.warning : theme.textTertiary;
}

export interface TaskRowProps {
  task: Task;
  onToggle: () => void;
  onPress: () => void;
}

export function TaskRow({ task, onToggle, onPress }: TaskRowProps) {
  const theme = useTheme();
  const t = useT();
  const { preferences } = usePreferences();
  const priorityColor = usePriorityColor();

  const overdue = isOverdue(task);

  const dueLabel = task.dueDate
    ? formatDateHeading(task.dueDate, preferences.language, {
        today: t('common.today'),
        yesterday: t('common.yesterday'),
      })
    : null;

  return (
    <View style={styles.row}>
      <Checkbox
        checked={task.completed}
        onToggle={onToggle}
        tint={priorityColor(task.priority)}
        accessibilityLabel={task.completed ? t('tasks.uncomplete') : t('tasks.complete')}
      />

      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={task.title}
        onPress={onPress}
        scaleTo={0.99}
        style={styles.body}>
        <Text
          variant="bodyStrong"
          color={task.completed ? 'textTertiary' : 'text'}
          numberOfLines={2}
          style={task.completed && styles.done}>
          {task.title}
        </Text>

        {task.description ? (
          <Text variant="caption" color="textSecondary" numberOfLines={1}>
            {task.description}
          </Text>
        ) : null}

        {dueLabel || task.reminderAt ? (
          <View style={styles.meta}>
            {dueLabel ? (
              <View style={styles.metaItem}>
                <Icon
                  name="calendar-outline"
                  size={12}
                  tint={overdue ? theme.expense : theme.textTertiary}
                />
                <Text variant="caption" tint={overdue ? theme.expense : theme.textTertiary}>
                  {overdue ? `${t('tasks.overdue')} · ${dueLabel}` : dueLabel}
                </Text>
              </View>
            ) : null}

            {task.reminderAt ? (
              <View style={styles.metaItem}>
                <Icon name="notifications-outline" size={12} color="textTertiary" />
                <Text variant="caption" color="textTertiary">
                  {formatReminderTime(task.reminderAt, preferences.language)}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </PressableScale>

      {task.priority === 'high' && !task.completed ? (
        <View style={[styles.flag, { backgroundColor: theme.expenseSoft }]}>
          <Icon name="flag" size={12} tint={theme.expense} />
        </View>
      ) : null}
    </View>
  );
}

function formatReminderTime(iso: string, language: string): string {
  try {
    return new Intl.DateTimeFormat(language === 'km' ? 'km-KH' : 'en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return fromISODate(iso.slice(0, 10)).toDateString();
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  body: { flex: 1, gap: 2 },
  done: { textDecorationLine: 'line-through' },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginTop: 2 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  flag: {
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
});
