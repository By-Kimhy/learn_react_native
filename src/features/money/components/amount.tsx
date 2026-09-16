import { StyleSheet, View } from 'react-native';

import { Text, tabularNumbers } from '@/components/ui/text';
import type { ThemeColor, TypographyVariant } from '@/constants/theme';
import type { Currency } from '@/types';

import { formatAmount } from '../currency';

export type AmountTone = 'neutral' | 'income' | 'expense';

const toneColor: Record<AmountTone, ThemeColor> = {
  neutral: 'text',
  income: 'income',
  expense: 'expense',
};

export interface AmountProps {
  value: number;
  currency: Currency;
  variant?: TypographyVariant;
  sign?: 'auto' | 'always' | 'never';
  tone?: AmountTone;
  /** Overrides the tone colour — used on the coloured balance card. */
  tint?: string;
  align?: 'left' | 'right' | 'center';
}

export function Amount({
  value,
  currency,
  variant = 'body',
  sign = 'auto',
  tone = 'neutral',
  tint,
  align,
}: AmountProps) {
  return (
    <Text
      variant={variant}
      color={toneColor[tone]}
      tint={tint}
      align={align}
      style={tabularNumbers}
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.85}>
      {formatAmount(value, currency, { sign })}
    </Text>
  );
}

export interface DualAmountProps {
  primary: number;
  primaryCurrency: Currency;
  secondary: number;
  secondaryCurrency: Currency;
  primaryVariant?: TypographyVariant;
  secondaryVariant?: TypographyVariant;
  sign?: 'auto' | 'always' | 'never';
  tone?: AmountTone;
  primaryTint?: string;
  secondaryTint?: string;
  align?: 'left' | 'right' | 'center';
}

/**
 * The app's signature money treatment: the preferred currency large, the
 * equivalent in the other currency directly underneath. The user never has to
 * convert anything themselves.
 */
export function DualAmount({
  primary,
  primaryCurrency,
  secondary,
  secondaryCurrency,
  primaryVariant = 'subheading',
  secondaryVariant = 'caption',
  sign = 'auto',
  tone = 'neutral',
  primaryTint,
  secondaryTint,
  align = 'right',
}: DualAmountProps) {
  return (
    <View style={[styles.stack, align === 'right' && styles.right, align === 'center' && styles.center]}>
      <Amount
        value={primary}
        currency={primaryCurrency}
        variant={primaryVariant}
        sign={sign}
        tone={tone}
        tint={primaryTint}
        align={align}
      />
      <Text
        variant={secondaryVariant}
        color="textSecondary"
        tint={secondaryTint}
        align={align}
        style={tabularNumbers}
        numberOfLines={1}>
        {formatAmount(secondary, secondaryCurrency, { sign })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 1 },
  right: { alignItems: 'flex-end' },
  center: { alignItems: 'center' },
});
