import { StyleSheet } from 'react-native';

import { Card } from '@/components/ui/card';
import { Text, tabularNumbers } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import type { Currency } from '@/types';

import { formatAmount } from '../currency';
import type { AmountTone } from './amount';

export interface StatCardProps {
  label: string;
  value: number;
  currency: Currency;
  secondaryValue?: number;
  secondaryCurrency?: Currency;
  tone?: AmountTone;
  sign?: 'auto' | 'always' | 'never';
}

export function StatCard({
  label,
  value,
  currency,
  secondaryValue,
  secondaryCurrency,
  tone = 'neutral',
  sign = 'auto',
}: StatCardProps) {
  return (
    <Card style={styles.card}>
      <Text variant="caption" color="textSecondary" numberOfLines={1}>
        {label}
      </Text>

      <Text
        variant="subheading"
        color={tone === 'income' ? 'income' : tone === 'expense' ? 'expense' : 'text'}
        style={tabularNumbers}
        numberOfLines={1}>
        {formatAmount(value, currency, { sign })}
      </Text>

      {secondaryValue !== undefined && secondaryCurrency ? (
        <Text variant="caption" color="textTertiary" style={tabularNumbers} numberOfLines={1}>
          {formatAmount(secondaryValue, secondaryCurrency, { sign })}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  // Two per row on a phone. Narrower than this and long KHR figures truncate.
  card: { flex: 1, minWidth: 150, gap: Spacing.xs, padding: Spacing.lg },
});
