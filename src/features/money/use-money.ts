import { useMemo } from 'react';

import { usePreferences } from '@/features/settings/store';
import type { Currency, Transaction } from '@/types';

import { amountIn, convertAndRound, formatAmount, otherCurrency } from './currency';

export interface MoneyFormatter {
  /** The currency the user chose to read amounts in. */
  display: Currency;
  /** The other of the two supported currencies, shown underneath. */
  secondary: Currency;
  rate: number;
  format: (amount: number, currency: Currency, sign?: 'auto' | 'always' | 'never') => string;
  /** Converts a display-currency amount into the secondary currency. */
  toSecondary: (amount: number) => number;
  /** Reads a stored transaction in the display currency. */
  read: (transaction: Transaction) => number;
  readSecondary: (transaction: Transaction) => number;
}

/** One hook for every "show me this amount" need, bound to the user's settings. */
export function useMoney(): MoneyFormatter {
  const { preferences } = usePreferences();

  return useMemo(() => {
    const display = preferences.displayCurrency;
    const secondary = otherCurrency(display);
    const rate = preferences.exchangeRate;

    return {
      display,
      secondary,
      rate,
      format: (amount, currency, sign = 'auto') => formatAmount(amount, currency, { sign }),
      toSecondary: (amount) => convertAndRound(amount, display, secondary, rate),
      read: (transaction) => amountIn(transaction, display),
      readSecondary: (transaction) => amountIn(transaction, secondary),
    };
  }, [preferences.displayCurrency, preferences.exchangeRate]);
}
