import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { SwipeRow } from '@/components/ui/swipe-row';
import { Spacing } from '@/constants/theme';
import { useT } from '@/features/settings/store';
import { useTheme } from '@/hooks/use-theme';
import type { Task } from '@/types';

import { TaskRow } from './task-row';

export interface TaskListProps {
  tasks: Task[];
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
  onSelect: (task: Task) => void;
}

/** Swipe right to complete, left to delete — the two actions the spec calls for. */
export function TaskList({ tasks, onToggle, onDelete, onSelect }: TaskListProps) {
  const theme = useTheme();
  const t = useT();

  return (
    <Card padded={false} style={styles.card}>
      {tasks.map((task, index) => (
        <Fragment key={task.id}>
          {index > 0 ? <Divider inset={Spacing.lg} /> : null}

          <SwipeRow
            left={{
              label: task.completed ? t('tasks.uncomplete') : t('tasks.complete'),
              icon: task.completed ? 'arrow-undo' : 'checkmark',
              background: theme.incomeSoft,
              tint: theme.income,
              onPress: () => onToggle(task),
            }}
            right={{
              label: t('common.delete'),
              icon: 'trash',
              background: theme.expenseSoft,
              tint: theme.expense,
              onPress: () => onDelete(task),
              keepOpen: true,
            }}>
            <View style={styles.rowInner}>
              <TaskRow task={task} onToggle={() => onToggle(task)} onPress={() => onSelect(task)} />
            </View>
          </SwipeRow>
        </Fragment>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden' },
  rowInner: { paddingHorizontal: Spacing.lg },
});
