import { StyleSheet, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { IconTile } from '@/components/ui/icon-tile';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { usePreferences, useT } from '@/features/settings/store';
import { useTheme } from '@/hooks/use-theme';
import { formatWeekdayShort, fromISODate } from '@/lib/date';
import type { Habit, ISODate } from '@/types';

import { currentStreak, weekDays, weeklyProgress, type WeekDay } from '../selectors';

export interface HabitCardProps {
  habit: Habit;
  /** Every date this habit has been completed on. */
  dates: Set<ISODate>;
  onToggleDay: (date: ISODate) => void;
  onPress: () => void;
}

/**
 * One habit at a glance: streak, this week's day row, and a tap target for
 * today. Past days in the row are tappable so a missed tick can be fixed.
 */
export function HabitCard({ habit, dates, onToggleDay, onPress }: HabitCardProps) {
  const t = useT();
  const { preferences } = usePreferences();

  const streak = currentStreak(dates);
  const days = weekDays(dates);
  const week = weeklyProgress(habit, dates);
  const today = days.find((day) => day.isToday);
  const doneToday = today?.done ?? false;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={habit.name}
          onPress={onPress}
          scaleTo={0.98}
          style={styles.identity}>
          <IconTile emoji={habit.emoji} tone={doneToday ? 'green' : 'blue'} size={42} />

          <View style={styles.titleGroup}>
            <Text variant="bodyStrong" numberOfLines={1}>
              {habit.name}
            </Text>
            <Text variant="caption" color="textSecondary" numberOfLines={1}>
              {habit.frequency === 'daily'
                ? t('habits.daily')
                : t('habits.timesPerWeek', { count: habit.timesPerWeek })}
              {' · '}
              {t('habits.thisWeek')} {week.done}/{week.target}
            </Text>
          </View>
        </PressableScale>

        <Badge
          label={streak > 0 ? t('habits.streak', { count: streak }) : t('habits.noStreak')}
          tone={streak > 0 ? 'orange' : 'grey'}
          icon={streak > 0 ? 'flame' : undefined}
        />
      </View>

      <View style={styles.week}>
        {days.map((day) => (
          <DayCell key={day.date} day={day} language={preferences.language} onPress={onToggleDay} />
        ))}
      </View>
    </Card>
  );
}

function DayCell({
  day,
  language,
  onPress,
}: {
  day: WeekDay;
  language: string;
  onPress: (date: ISODate) => void;
}) {
  const theme = useTheme();
  const label = formatWeekdayShort(fromISODate(day.date), language).slice(0, 2);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ checked: day.done, disabled: day.isFuture }}
      accessibilityLabel={day.date}
      disabled={day.isFuture}
      onPress={() => onPress(day.date)}
      scaleTo={0.85}
      style={styles.dayCell}>
      <Text
        variant="captionStrong"
        tint={day.isToday ? theme.primary : theme.textTertiary}
        style={styles.dayLabel}>
        {label}
      </Text>

      <View
        style={[
          styles.dayDot,
          {
            backgroundColor: day.done ? theme.primary : theme.surfaceAlt,
            // Today gets a ring rather than a fill, so "today" and "done" stay
            // legible as two separate facts on the same circle.
            borderColor: day.isToday ? theme.primary : 'transparent',
            borderWidth: day.isToday ? 2 : 0,
            opacity: day.isFuture ? 0.5 : 1,
          },
        ]}>
        {day.done ? (
          <Icon name="checkmark" size={14} tint={theme.onPrimary} />
        ) : (
          <View style={[styles.emptyDot, { backgroundColor: theme.textTertiary }]} />
        )}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  identity: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  titleGroup: { flex: 1, gap: 1 },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCell: { alignItems: 'center', gap: Spacing.sm, flex: 1 },
  dayLabel: { fontSize: 11 },
  dayDot: {
    width: 30,
    height: 30,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDot: { width: 5, height: 5, borderRadius: Radius.pill, opacity: 0.6 },
});
