import { StyleSheet, View } from 'react-native';

import { Text, tabularNumbers } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useT } from '@/features/settings/store';
import { useTheme } from '@/hooks/use-theme';
import type { Currency } from '@/types';

import { getCategory } from '../categories';
import { formatAmount } from '../currency';
import type { CategoryTotal } from '../selectors';

export interface CategoryBreakdownProps {
  totals: CategoryTotal[];
  currency: Currency;
  /** Trims a long tail so the card stays scannable. */
  limit?: number;
}

/** A proportional bar list — readable at a glance and cheap to render. */
export function CategoryBreakdown({ totals, currency, limit }: CategoryBreakdownProps) {
  const theme = useTheme();
  const t = useT();
  const rows = limit ? totals.slice(0, limit) : totals;

  return (
    <View style={styles.list}>
      {rows.map((row) => {
        const category = getCategory(row.categoryId);

        return (
          <View key={row.categoryId} style={styles.row}>
            <View style={styles.header}>
              <Text variant="caption">{category.emoji}</Text>
              <Text variant="captionStrong" style={styles.name} numberOfLines={1}>
                {t(category.labelKey)}
              </Text>
              <Text variant="caption" color="textSecondary" style={tabularNumbers}>
                {Math.round(row.share * 100)}%
              </Text>
              <Text variant="captionStrong" style={tabularNumbers}>
                {formatAmount(row.total, currency)}
              </Text>
            </View>

            <View style={[styles.track, { backgroundColor: theme.surfaceAlt }]}>
              <View
                style={[
                  styles.fill,
                  { width: `${Math.max(row.share * 100, 2)}%`, backgroundColor: theme.primary },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.md },
  row: { gap: Spacing.xs },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  name: { flex: 1 },
  track: { height: 6, borderRadius: Radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radius.pill },
});
