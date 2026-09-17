import { StyleSheet, View } from 'react-native';

import { IconTile } from '@/components/ui/icon-tile';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { usePreferences, useT } from '@/features/settings/store';
import { formatDateHeading } from '@/lib/date';
import type { Transaction } from '@/types';

import { getCategory } from '../categories';
import { toneFor } from '../category-tones';
import { useMoney } from '../use-money';
import { DualAmount } from './amount';

export interface TransactionRowProps {
  transaction: Transaction;
  onPress?: () => void;
}

export function TransactionRow({ transaction, onPress }: TransactionRowProps) {
  const t = useT();
  const { preferences } = usePreferences();
  const { display, secondary, read, readSecondary } = useMoney();

  const category = getCategory(transaction.categoryId);
  const isIncome = transaction.type === 'income';
  // Expenses are stored positive; the row renders them negative so the sign,
  // not just the colour, tells the user which direction money moved.
  const signOf = isIncome ? 1 : -1;
  const categoryName = t(category.labelKey);

  const row = (
    <View style={styles.row}>
      {/* Tinted by category rather than by direction: the amount's sign and
          colour already say which way the money went. */}
      <IconTile emoji={category.emoji} tone={toneFor(category.id)} size={42} shape="circle" />

      <View style={styles.copy}>
        {/* Category and note share the first line — the note is what tells one
            coffee from another, so it belongs beside the category, not under
            it, leaving the second line free for the date. */}
        <Text variant="bodyStrong" numberOfLines={1}>
          {transaction.note ? `${categoryName} · ${transaction.note}` : categoryName}
        </Text>
        <Text variant="caption" color="textTertiary" numberOfLines={1}>
          {formatDateHeading(transaction.date, preferences.language, {
            today: t('common.today'),
            yesterday: t('common.yesterday'),
          })}
        </Text>
      </View>

      <DualAmount
        primary={signOf * read(transaction)}
        primaryCurrency={display}
        secondary={signOf * readSecondary(transaction)}
        secondaryCurrency={secondary}
        primaryVariant="bodyStrong"
        sign="always"
        tone={isIncome ? 'income' : 'neutral'}
        align="right"
      />
    </View>
  );

  if (!onPress) return row;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${categoryName}, ${transaction.note ?? ''}`}
      onPress={onPress}
      scaleTo={0.985}>
      {row}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  copy: { flex: 1, gap: 1 },
});
