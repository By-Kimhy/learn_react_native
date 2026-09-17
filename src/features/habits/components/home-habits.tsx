import { ScrollView, StyleSheet, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { IconTile } from '@/components/ui/icon-tile';
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
  /** Current streak per habit id — each card reports its own, not the best. */
  streaks: Map<string, number>;
  onToggle: (habit: Habit) => void;
  onCreate: () => void;
}

const CARD_WIDTH = 148;

/** A scrollable row of today's habits, each with its own tick button. */
export function HomeHabits({ habits, doneToday, streaks, onToggle, onCreate }: HomeHabitsProps) {
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
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // Negative margin lets the row bleed to the screen edge while the cards
      // still line up with the padded content above them.
      style={styles.scroll}
      contentContainerStyle={styles.track}>
      {habits.map((habit) => {
        const done = doneToday.has(habit.id);
        const streak = streaks.get(habit.id) ?? 0;

        return (
          <Card key={habit.id} style={styles.card}>
            <View style={styles.head}>
              <IconTile emoji={habit.emoji} tone={done ? 'green' : 'blue'} size={34} />
              {streak > 0 ? <Badge label={String(streak)} tone="red" icon="flame" /> : null}
            </View>

            <View style={styles.copy}>
              <Text variant="bodyStrong" numberOfLines={1}>
                {habit.name}
              </Text>
              <Text variant="caption" color="textSecondary" numberOfLines={1}>
                {habit.frequency === 'daily'
                  ? t('habits.daily')
                  : t('habits.timesPerWeek', { count: habit.timesPerWeek })}
              </Text>
            </View>

            <PressableScale
              accessibilityRole="checkbox"
              accessibilityState={{ checked: done }}
              accessibilityLabel={habit.name}
              onPress={() => onToggle(habit)}
              scaleTo={0.94}
              style={[
                styles.tick,
                { backgroundColor: done ? theme.primary : theme.surfaceAlt },
              ]}>
              <Icon
                name={done ? 'checkmark' : 'add'}
                size={18}
                tint={done ? theme.onPrimary : theme.textSecondary}
              />
            </PressableScale>
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginHorizontal: -Spacing.lg },
  track: { gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: 2 },
  card: { width: CARD_WIDTH, gap: Spacing.sm, padding: Spacing.md },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.xs },
  copy: { gap: 1 },
  tick: {
    minHeight: 38,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs },
});
