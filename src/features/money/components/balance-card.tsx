import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text, tabularNumbers } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useT } from '@/features/settings/store';
import { useAccent, useTheme } from '@/hooks/use-theme';

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
 * The balance hero. A white card rather than a colour block: the two flows
 * underneath carry the colour, which leaves the balance itself as the only
 * black figure on the screen and therefore the first thing read.
 */
export function BalanceCard({ totals, caption, incomeLabel, expensesLabel }: BalanceCardProps) {
  const t = useT();
  const { display, secondary, toSecondary } = useMoney();

  return (
    <Card style={styles.card}>
      <Text variant="overline" color="textTertiary" numberOfLines={1}>
        {(caption ?? t('money.balance')).toUpperCase()}
      </Text>

      <View style={styles.balanceGroup}>
        <Text
          variant="amount"
          style={tabularNumbers}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.6}>
          {formatAmount(totals.balance, display)}
        </Text>

        <Text variant="body" color="textSecondary" style={tabularNumbers} numberOfLines={1}>
          {formatAmount(toSecondary(totals.balance), secondary)}
        </Text>
      </View>

      <View style={styles.flows}>
        <Flow
          label={incomeLabel ?? t('money.income')}
          amount={totals.income}
          sign="+"
          accent="green"
          icon="arrow-down"
        />
        <Flow
          label={expensesLabel ?? t('money.expenses')}
          amount={totals.expenses}
          sign="-"
          accent="red"
          icon="arrow-up"
        />
      </View>
    </Card>
  );
}

function Flow({
  label,
  amount,
  sign,
  accent,
  icon,
}: {
  label: string;
  amount: number;
  sign: '+' | '-';
  accent: 'green' | 'red';
  icon: 'arrow-down' | 'arrow-up';
}) {
  const theme = useTheme();
  const { display, secondary, toSecondary } = useMoney();
  const { soft, tint } = useAccent(accent);

  return (
    <View style={[styles.flow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.flowIcon, { backgroundColor: soft }]}>
        <Icon name={icon} size={14} tint={tint} />
      </View>

      <View style={styles.flowCopy}>
        <Text variant="caption" color="textSecondary" numberOfLines={1}>
          {label}
        </Text>
        <Text variant="bodyStrong" tint={tint} style={tabularNumbers} numberOfLines={1}>
          {sign}
          {formatAmount(amount, display, { sign: 'never' })}
        </Text>

        {/* The same figure in the other currency, as the Money tiles show it —
            the rate is user-editable, so both sides stay on screen. */}
        <Text variant="caption" color="textTertiary" style={tabularNumbers} numberOfLines={1}>
          {sign}
          {formatAmount(toSecondary(amount), secondary, { sign: 'never' })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.sm },
  balanceGroup: { gap: 2 },
  flows: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
  flow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    // One step inside the card's radius, so the corners stay concentric.
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  flowIcon: {
    width: 28,
    height: 28,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowCopy: { flex: 1, minWidth: 0, gap: 1 },
});
