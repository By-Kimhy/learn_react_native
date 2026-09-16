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
            <Text variant="caption" color="textTertiary" align="center">
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
              <View
                style={[
                  styles.day,
                  isSelected && { backgroundColor: theme.primary },
                  !isSelected && cell.isToday && { borderWidth: 1.5, borderColor: theme.primary },
                ]}>
                <Text
                  variant="caption"
                  tint={
                    isSelected
                      ? theme.onPrimary
                      : cell.inMonth
                        ? cell.isToday
                          ? theme.primary
                          : theme.text
                        : theme.textTertiary
                  }>
                  {cell.day}
                </Text>
              </View>

              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: cell.hasEvents
                      ? isSelected
                        ? theme.primary
                        : theme.textSecondary
                      : 'transparent',
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
    width: 34,
    height: 34,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 5, height: 5, borderRadius: Radius.pill },
});
