import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
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
  const theme = useTheme();
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
          <View style={[styles.emoji, { backgroundColor: theme.surfaceAlt }]}>
            <Text variant="subheading">{habit.emoji}</Text>
          </View>

          <View style={styles.titleGroup}>
            <Text variant="bodyStrong" numberOfLines={1}>
              {habit.name}
            </Text>
            <Text variant="caption" color={streak > 0 ? 'warning' : 'textTertiary'}>
              {streak > 0 ? `🔥 ${t('habits.streak', { count: streak })}` : t('habits.noStreak')}
            </Text>
          </View>
        </PressableScale>

        <PressableScale
          accessibilityRole="checkbox"
          accessibilityState={{ checked: doneToday }}
          accessibilityLabel={doneToday ? t('habits.markNotDone') : t('habits.markDone')}
          onPress={() => today && onToggleDay(today.date)}
          scaleTo={0.88}
          style={[
            styles.todayButton,
            {
              backgroundColor: doneToday ? theme.income : theme.surfaceAlt,
              borderColor: doneToday ? theme.income : theme.border,
            },
          ]}>
          <Icon
            name={doneToday ? 'checkmark' : 'add'}
            size={22}
            tint={doneToday ? theme.onPrimary : theme.textSecondary}
          />
        </PressableScale>
      </View>

      <View style={styles.week}>
        {days.map((day) => (
          <DayCell key={day.date} day={day} language={preferences.language} onPress={onToggleDay} />
        ))}
      </View>

      <Text variant="caption" color="textTertiary">
        {t('habits.thisWeek')} · {week.done}/{week.target}
      </Text>
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
      <Text variant="caption" color="textTertiary" style={styles.dayLabel}>
        {label}
      </Text>

      <View
        style={[
          styles.dayDot,
          {
            backgroundColor: day.done ? theme.income : 'transparent',
            borderColor: day.isToday ? theme.primary : theme.border,
            borderWidth: day.isToday ? 2 : StyleSheet.hairlineWidth,
            opacity: day.isFuture ? 0.4 : 1,
          },
        ]}>
        {day.done ? <Icon name="checkmark" size={13} tint={theme.onPrimary} /> : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  identity: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  emoji: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleGroup: { flex: 1, gap: 1 },
  todayButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCell: { alignItems: 'center', gap: Spacing.xs, flex: 1 },
  dayLabel: { fontSize: 11 },
  dayDot: {
    width: 28,
    height: 28,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
