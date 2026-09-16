import { StyleSheet, View } from 'react-native';

import { Text, tabularNumbers } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Currency } from '@/types';

import { formatAmount } from '../currency';
import type { Bucket } from '../selectors';

export interface BarChartProps {
  buckets: Bucket[];
  currency: Currency;
  /** `both` draws paired income/expense bars; `expenses` draws one series. */
  series?: 'both' | 'expenses';
  height?: number;
}

/**
 * A dependency-free bar chart. Charting libraries would add weight and native
 * config for what is, at this size, a handful of proportional rectangles.
 */
export function BarChart({ buckets, currency, series = 'both', height = 132 }: BarChartProps) {
  const theme = useTheme();

  const peak = Math.max(
    ...buckets.map((bucket) => (series === 'both' ? Math.max(bucket.income, bucket.expenses) : bucket.expenses)),
    0
  );

  /** A flat-zero chart would divide by zero; fall back to a 1-unit scale. */
  const scale = peak > 0 ? peak : 1;

  return (
    <View style={styles.container}>
      <Text variant="caption" color="textTertiary" align="right" style={tabularNumbers}>
        {`max ${formatAmount(peak, currency)}`}
      </Text>

      <View style={[styles.plot, { height }]}>
        {buckets.map((bucket) => (
          <View key={bucket.key} style={styles.column}>
            <View style={styles.bars}>
              {series === 'both' ? (
                <Bar value={bucket.income} scale={scale} height={height} color={theme.income} />
              ) : null}
              <Bar value={bucket.expenses} scale={scale} height={height} color={theme.expense} />
            </View>

            <Text variant="caption" color="textTertiary" numberOfLines={1} align="center">
              {bucket.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Bar({
  value,
  scale,
  height,
  color,
}: {
  value: number;
  scale: number;
  height: number;
  color: string;
}) {
  // Keep a 2pt stub for empty buckets so the axis still reads as a series.
  const barHeight = value > 0 ? Math.max((value / scale) * (height - 22), 4) : 2;

  return (
    <View
      style={[
        styles.bar,
        { height: barHeight, backgroundColor: color, opacity: value > 0 ? 1 : 0.3 },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.xs },
  plot: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.xs },
  column: { flex: 1, alignItems: 'center', gap: Spacing.xs, justifyContent: 'flex-end' },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  bar: { width: 9, borderRadius: Radius.sm },
});
