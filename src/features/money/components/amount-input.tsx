import { StyleSheet, TextInput, View } from 'react-native';

import { SegmentedControl } from '@/components/ui/segmented-control';
import { Text, tabularNumbers } from '@/components/ui/text';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useT } from '@/features/settings/store';
import { useTheme } from '@/hooks/use-theme';
import type { Currency, TransactionType } from '@/types';

import { convertAndRound, CurrencySymbols, Currencies, formatAmount, otherCurrency, parseAmount } from '../currency';

export interface AmountInputProps {
  value: string;
  onChangeValue: (value: string) => void;
  currency: Currency;
  onChangeCurrency: (currency: Currency) => void;
  rate: number;
  type: TransactionType;
  error?: string;
  autoFocus?: boolean;
}

/**
 * Amount + currency in one control, with the live equivalent underneath. The
 * figure is the hero of the form rather than a labelled field: it is the one
 * thing the user came to type, and the conversion updates as they do so they
 * never have to do the maths.
 */
export function AmountInput({
  value,
  onChangeValue,
  currency,
  onChangeCurrency,
  rate,
  type,
  error,
  autoFocus = false,
}: AmountInputProps) {
  const theme = useTheme();
  const t = useT();

  const parsed = parseAmount(value);
  const target = otherCurrency(currency);
  const converted = parsed === null ? null : convertAndRound(parsed, currency, target, rate);
  const accent = type === 'income' ? theme.income : theme.expense;

  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <Text variant="title" tint={error ? theme.expense : theme.textTertiary} style={styles.symbol}>
          {CurrencySymbols[currency]}
        </Text>

        <TextInput
          value={value}
          onChangeText={onChangeValue}
          keyboardType="decimal-pad"
          inputMode="decimal"
          placeholder="0"
          placeholderTextColor={theme.textTertiary}
          autoFocus={autoFocus}
          accessibilityLabel={t('transaction.amount')}
          style={[
            styles.input,
            Typography.amountLarge,
            tabularNumbers,
            { color: error ? theme.expense : theme.text },
          ]}
        />
      </View>

      {/* Narrower than the form so the toggle reads as a control on the figure
          rather than as the next field down. */}
      <View style={styles.currencyRow}>
        <SegmentedControl
          accessibilityLabel={t('transaction.currency')}
          options={Currencies.map((code) => ({ value: code, label: `${CurrencySymbols[code]} ${code}` }))}
          value={currency}
          onChange={onChangeCurrency}
          style={styles.currency}
        />
      </View>

      {error ? (
        <Text variant="caption" color="expense" align="center">
          {error}
        </Text>
      ) : (
        <Text
          variant="caption"
          color="textSecondary"
          align="center"
          style={tabularNumbers}
          numberOfLines={2}>
          {t('transaction.equals')} {formatAmount(converted ?? 0, target)}
          {'  ·  '}
          {t('transaction.rateNote')} 1 USD = {rate.toLocaleString('en-US')} KHR
        </Text>
      )}

      {/* A hairline in the type's colour, so income and expense forms are
          distinguishable at a glance without colouring the figure itself. */}
      <View style={[styles.accent, { backgroundColor: accent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md, alignItems: 'center' },
  field: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: Spacing.sm,
    maxWidth: '100%',
  },
  symbol: { opacity: 0.8 },
  // Shrinks with the figure instead of stretching, which would push the symbol
  // off to the left edge of the form.
  input: { flexShrink: 1, minWidth: 80, padding: 0, textAlign: 'left' },
  currencyRow: { width: '100%', alignItems: 'center' },
  currency: { width: 200, maxWidth: '100%' },
  accent: { width: 44, height: 3, borderRadius: Radius.pill, opacity: 0.9 },
});
