import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import type { Bucket } from '../selectors';

export interface BarChartProps {
  buckets: Bucket[];
  /** `both` draws paired income/expense bars; `expenses` draws one series. */
  series?: 'both' | 'expenses';
  height?: number;
}

/** Height reserved under the plot for the bucket labels. */
const LABEL_BAND = 22;
/** Fractions of the peak to rule a gridline at. */
const GRIDLINES = [1, 0.5, 0];

/**
 * A dependency-free bar chart. Charting libraries would add weight and native
 * config for what is, at this size, a handful of proportional rectangles.
 */
export function BarChart({ buckets, series = 'both', height = 150 }: BarChartProps) {
  const theme = useTheme();

  const peak = Math.max(
    ...buckets.map((bucket) => (series === 'both' ? Math.max(bucket.income, bucket.expenses) : bucket.expenses)),
    0
  );

  /** A flat-zero chart would divide by zero; fall back to a 1-unit scale. */
  const scale = peak > 0 ? peak : 1;
  const plotHeight = height - LABEL_BAND;

  return (
    <View style={styles.container}>
      <View style={[styles.plot, { height }]}>
        {/* Gridlines sit behind the bars and give the eye a baseline to read
            heights against, rather than a single "max" caption doing that job. */}
        <View style={[styles.grid, { bottom: LABEL_BAND }]}>
          {GRIDLINES.map((fraction) => (
            <View
              key={fraction}
              style={[
                styles.gridline,
                { bottom: fraction * plotHeight, backgroundColor: theme.border },
              ]}
            />
          ))}
        </View>

        {buckets.map((bucket) => (
          <View key={bucket.key} style={styles.column}>
            <View style={styles.bars}>
              {series === 'both' ? (
                <Bar value={bucket.income} scale={scale} height={plotHeight} color={theme.income} />
              ) : null}
              <Bar value={bucket.expenses} scale={scale} height={plotHeight} color={theme.expense} />
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
  // Keep a 3pt stub for empty buckets so the axis still reads as a series.
  const barHeight = value > 0 ? Math.max((value / scale) * height, 5) : 3;

  return (
    <View
      style={[
        styles.bar,
        { height: barHeight, backgroundColor: color, opacity: value > 0 ? 1 : 0.35 },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.xs },
  plot: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.xs },
  grid: { position: 'absolute', left: 0, right: 0, top: 0, pointerEvents: 'none' },
  gridline: { position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth },
  column: { flex: 1, alignItems: 'center', gap: Spacing.xs, justifyContent: 'flex-end' },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  bar: { width: 11, borderTopLeftRadius: Radius.xs, borderTopRightRadius: Radius.xs },
});
