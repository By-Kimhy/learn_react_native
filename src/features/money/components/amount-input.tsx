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
 * conversion is shown as the user types so they never have to do the maths.
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
      <Text variant="captionStrong" color="textSecondary">
        {t('transaction.amount')}
      </Text>

      <View
        style={[
          styles.field,
          { backgroundColor: theme.surfaceAlt, borderColor: error ? theme.expense : 'transparent' },
        ]}>
        <Text variant="title" tint={accent}>
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
          style={[styles.input, Typography.title, tabularNumbers, { color: theme.text }]}
        />
      </View>

      <SegmentedControl
        accessibilityLabel={t('transaction.currency')}
        options={Currencies.map((code) => ({ value: code, label: `${CurrencySymbols[code]} ${code}` }))}
        value={currency}
        onChange={onChangeCurrency}
      />

      {error ? (
        <Text variant="caption" color="expense">
          {error}
        </Text>
      ) : (
        <Text variant="caption" color="textSecondary" style={tabularNumbers}>
          {t('transaction.equals')} {formatAmount(converted ?? 0, target)}
          {'  ·  '}
          {t('transaction.rateNote')} 1 USD = {rate.toLocaleString('en-US')} KHR
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  input: { flex: 1, padding: 0 },
});
