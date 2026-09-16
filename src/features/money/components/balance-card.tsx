import { StyleSheet, View } from 'react-native';

import { Text, tabularNumbers } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/features/settings/store';

import { formatAmount } from '../currency';
import { useMoney } from '../use-money';
import type { Totals } from '../selectors';

export interface BalanceCardProps {
  totals: Totals;
  /** Caption above the balance, e.g. the month being shown. */
  caption?: string;
  /** Overrides let Home say "Income this month" while Money says "Income". */
  incomeLabel?: string;
  expensesLabel?: string;
}

/**
 * The balance hero. Deliberately the only strongly-coloured surface in the app
 * so it anchors both the Home and Money screens.
 */
export function BalanceCard({ totals, caption, incomeLabel, expensesLabel }: BalanceCardProps) {
  const theme = useTheme();
  const t = useT();
  const { display, secondary, toSecondary } = useMoney();

  const onCard = theme.onPrimary;
  const muted = { opacity: 0.72 };

  return (
    <View style={[styles.card, { backgroundColor: theme.primary }]}>
      <Text variant="overline" tint={onCard} style={muted}>
        {(caption ?? t('money.balance')).toUpperCase()}
      </Text>

      <View style={styles.balanceGroup}>
        <Text
          variant="display"
          tint={onCard}
          style={tabularNumbers}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.6}>
          {formatAmount(totals.balance, display)}
        </Text>
        <Text variant="body" tint={onCard} style={[tabularNumbers, muted]} numberOfLines={1}>
          {formatAmount(toSecondary(totals.balance), secondary)}
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: onCard }]} />

      <View style={styles.footer}>
        <Flow label={incomeLabel ?? t('money.income')} amount={totals.income} sign="+" tint={onCard} />
        <View style={[styles.verticalDivider, { backgroundColor: onCard }]} />
        <Flow label={expensesLabel ?? t('money.expenses')} amount={totals.expenses} sign="-" tint={onCard} />
      </View>
    </View>
  );
}

function Flow({
  label,
  amount,
  sign,
  tint,
}: {
  label: string;
  amount: number;
  sign: '+' | '-';
  tint: string;
}) {
  const { display } = useMoney();

  return (
    <View style={styles.flow}>
      <Text variant="caption" tint={tint} style={{ opacity: 0.72 }}>
        {label}
      </Text>
      <Text variant="bodyStrong" tint={tint} style={tabularNumbers} numberOfLines={1}>
        {sign}
        {formatAmount(amount, display, { sign: 'never' })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  balanceGroup: { gap: 2 },
  divider: { height: StyleSheet.hairlineWidth, opacity: 0.3 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  verticalDivider: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch', opacity: 0.3 },
  flow: { flex: 1, gap: 2 },
});
