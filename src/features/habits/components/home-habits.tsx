import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useT } from '@/features/settings/store';
import { useTheme } from '@/hooks/use-theme';
import type { Habit } from '@/types';

export interface HomeHabitsProps {
  habits: Habit[];
  /** Ids completed today. */
  doneToday: Set<string>;
  streak: number;
  onToggle: (habit: Habit) => void;
  onCreate: () => void;
}

/** A tappable row of today's habits, with the best running streak on top. */
export function HomeHabits({ habits, doneToday, streak, onToggle, onCreate }: HomeHabitsProps) {
  const theme = useTheme();
  const t = useT();

  if (habits.length === 0) {
    return (
      <Card>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={t('habits.createHabit')}
          onPress={onCreate}
          style={styles.empty}>
          <Icon name="flame-outline" size={22} color="textTertiary" />
          <Text variant="body" color="textSecondary">
            {t('habits.emptyBody')}
          </Text>
        </PressableScale>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      {streak > 0 ? (
        <Text variant="bodyStrong" color="warning">
          🔥 {t('habits.streak', { count: streak })}
        </Text>
      ) : null}

      <View style={styles.grid}>
        {habits.map((habit) => {
          const done = doneToday.has(habit.id);

          return (
            <PressableScale
              key={habit.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: done }}
              accessibilityLabel={habit.name}
              onPress={() => onToggle(habit)}
              scaleTo={0.94}
              style={[
                styles.chip,
                {
                  backgroundColor: done ? theme.incomeSoft : theme.surfaceAlt,
                  borderColor: done ? theme.income : 'transparent',
                },
              ]}>
              <Icon
                name={done ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                tint={done ? theme.income : theme.textTertiary}
              />
              <Text variant="caption">{habit.emoji}</Text>
              <Text
                variant="caption"
                color={done ? 'text' : 'textSecondary'}
                numberOfLines={1}
                style={styles.chipLabel}>
                {habit.name}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    maxWidth: '100%',
    minHeight: 36,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  chipLabel: { flexShrink: 1 },
  empty: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs },
});
