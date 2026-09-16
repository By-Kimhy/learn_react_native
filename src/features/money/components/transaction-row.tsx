import { StyleSheet, View } from 'react-native';

import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useT } from '@/features/settings/store';
import { useTheme } from '@/hooks/use-theme';
import type { Transaction } from '@/types';

import { getCategory } from '../categories';
import { useMoney } from '../use-money';
import { DualAmount } from './amount';

export interface TransactionRowProps {
  transaction: Transaction;
  onPress?: () => void;
}

export function TransactionRow({ transaction, onPress }: TransactionRowProps) {
  const theme = useTheme();
  const t = useT();
  const { display, secondary, read, readSecondary } = useMoney();

  const category = getCategory(transaction.categoryId);
  const isIncome = transaction.type === 'income';
  // Expenses are stored positive; the row renders them negative so the sign,
  // not just the colour, tells the user which direction money moved.
  const signOf = isIncome ? 1 : -1;
  const categoryName = t(category.labelKey);

  const row = (
    <View style={styles.row}>
      <View
        style={[
          styles.badge,
          { backgroundColor: isIncome ? theme.incomeSoft : theme.expenseSoft },
        ]}>
        <Text variant="subheading">{category.emoji}</Text>
      </View>

      <View style={styles.copy}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {categoryName}
        </Text>
        {transaction.note ? (
          <Text variant="caption" color="textSecondary" numberOfLines={1}>
            {transaction.note}
          </Text>
        ) : null}
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
  badge: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: 1 },
});
