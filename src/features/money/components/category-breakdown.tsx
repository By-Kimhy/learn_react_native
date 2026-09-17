import { StyleSheet, View } from 'react-native';

import { Text, tabularNumbers } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useT } from '@/features/settings/store';
import { useAccents, useTheme } from '@/hooks/use-theme';
import type { Currency } from '@/types';

import { getCategory } from '../categories';
import { toneFor } from '../category-tones';
import { formatAmount } from '../currency';
import type { CategoryTotal } from '../selectors';

export interface CategoryBreakdownProps {
  totals: CategoryTotal[];
  currency: Currency;
  /** Trims a long tail so the card stays scannable. */
  limit?: number;
  /** Adds the single proportional bar above the list — the whole period at once. */
  stacked?: boolean;
}

/** A proportional bar list — readable at a glance and cheap to render. */
export function CategoryBreakdown({ totals, currency, limit, stacked = false }: CategoryBreakdownProps) {
  const theme = useTheme();
  const accents = useAccents();
  const t = useT();
  const rows = limit ? totals.slice(0, limit) : totals;

  return (
    <View style={[styles.list, stacked && styles.listStacked]}>
      {stacked && rows.length > 0 ? (
        <View style={[styles.stack, { backgroundColor: theme.surfaceAlt }]}>
          {rows.map((row) => (
            <View
              key={row.categoryId}
              style={{
                // A hair of width for tiny shares, so no category vanishes.
                flexGrow: Math.max(row.share, 0.01),
                backgroundColor: accents[toneFor(row.categoryId)].tint,
              }}
            />
          ))}
        </View>
      ) : null}

      {rows.map((row) => {
        const category = getCategory(row.categoryId);
        const tint = accents[toneFor(row.categoryId)].tint;

        return (
          <View key={row.categoryId} style={styles.row}>
            <View style={styles.header}>
              <View style={[styles.dot, { backgroundColor: tint }]} />
              <Text variant="captionStrong" style={styles.name} numberOfLines={1}>
                {t(category.labelKey)}
              </Text>
              <Text variant="captionStrong" style={tabularNumbers}>
                {formatAmount(row.total, currency)}
              </Text>
              <Text variant="caption" color="textSecondary" style={[tabularNumbers, styles.share]}>
                {Math.round(row.share * 100)}%
              </Text>
            </View>

            {stacked ? null : (
              <View style={[styles.track, { backgroundColor: theme.surfaceAlt }]}>
                <View
                  style={[
                    styles.fill,
                    { width: `${Math.max(row.share * 100, 2)}%`, backgroundColor: tint },
                  ]}
                />
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.md },
  // A stacked chart needs less air between its legend rows than bar rows do.
  listStacked: { gap: Spacing.sm },
  stack: {
    flexDirection: 'row',
    height: 10,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  row: { gap: Spacing.xs },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dot: { width: 9, height: 9, borderRadius: Radius.pill },
  name: { flex: 1 },
  // Fixed width keeps the percentages in a column rather than ragged.
  share: { minWidth: 34, textAlign: 'right' },
  track: { height: 6, borderRadius: Radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radius.pill },
});
