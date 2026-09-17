import { StyleSheet, View } from 'react-native';

import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { usePreferences } from '@/features/settings/store';
import { useTheme } from '@/hooks/use-theme';
import { formatWeekdayShort, startOfWeek } from '@/lib/date';
import type { ISODate } from '@/types';

import type { MonthCell } from '../selectors';

export interface MonthGridProps {
  cells: MonthCell[];
  selected: ISODate;
  onSelect: (date: ISODate) => void;
}

/** A Monday-first month, with a dot under any day that has something on it. */
export function MonthGrid({ cells, selected, onSelect }: MonthGridProps) {
  const theme = useTheme();
  const { preferences } = usePreferences();

  const weekStart = startOfWeek(new Date());
  const headings = Array.from({ length: 7 }, (_, index) =>
    formatWeekdayShort(
      new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + index),
      preferences.language
    ).slice(0, 2)
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {headings.map((heading, index) => (
          <View key={index} style={styles.cell}>
            <Text variant="captionStrong" color="textTertiary" align="center">
              {heading}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell) => {
          const isSelected = cell.date === selected;

          return (
            <PressableScale
              key={cell.date}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={cell.date}
              onPress={() => onSelect(cell.date)}
              scaleTo={0.88}
              style={styles.cell}>
              {/* Today is a solid disc and the selection a soft one, so the two
                  stay distinguishable on the day that is both. */}
              <View
                style={[
                  styles.day,
                  cell.isToday && { backgroundColor: theme.primary },
                  !cell.isToday && isSelected && { backgroundColor: theme.primarySoft },
                ]}>
                <Text
                  variant="captionStrong"
                  tint={
                    cell.isToday
                      ? theme.onPrimary
                      : isSelected
                        ? theme.primary
                        : cell.inMonth
                          ? theme.text
                          : theme.textTertiary
                  }>
                  {cell.day}
                </Text>
              </View>

              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: cell.hasEvents ? theme.primary : 'transparent',
                    opacity: cell.inMonth ? 1 : 0.4,
                  },
                ]}
              />
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.xs },
  row: { flexDirection: 'row' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  // Seven columns: a fraction rather than flex, so rows wrap at exactly 7.
  cell: { width: `${100 / 7}%`, alignItems: 'center', gap: 2, paddingVertical: 3 },
  day: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 5, height: 5, borderRadius: Radius.pill },
});
