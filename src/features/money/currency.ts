import type { Currency, Transaction } from '@/types';

export const Currencies: Currency[] = ['USD', 'KHR'];

export const CurrencySymbols: Record<Currency, string> = { USD: '$', KHR: '៛' };

/** USD is tracked to the cent; riel notes below 100 don't circulate, so KHR is whole. */
const DECIMALS: Record<Currency, number> = { USD: 2, KHR: 0 };

export function otherCurrency(currency: Currency): Currency {
  return currency === 'USD' ? 'KHR' : 'USD';
}

export function roundForCurrency(amount: number, currency: Currency): number {
  const factor = 10 ** DECIMALS[currency];
  return Math.round(amount * factor) / factor;
}

/** `rate` is always KHR per 1 USD. */
export function convert(amount: number, from: Currency, to: Currency, rate: number): number {
  if (from === to) return amount;
  return from === 'USD' ? amount * rate : amount / rate;
}

export function convertAndRound(
  amount: number,
  from: Currency,
  to: Currency,
  rate: number
): number {
  return roundForCurrency(convert(amount, from, to, rate), to);
}

export interface Conversion {
  exchangeRate: number;
  convertedAmount: number;
  convertedCurrency: Currency;
}

/** Builds the mirrored-currency fields every transaction stores alongside the original. */
export function buildConversion(amount: number, currency: Currency, rate: number): Conversion {
  const convertedCurrency = otherCurrency(currency);
  return {
    exchangeRate: rate,
    convertedAmount: convertAndRound(amount, currency, convertedCurrency, rate),
    convertedCurrency,
  };
}

/**
 * Reads a transaction in `target`, preferring the amounts stored on the record.
 * That keeps historical entries at the rate they were created with even after
 * the user edits the rate in Settings.
 */
export function amountIn(transaction: Transaction, target: Currency): number {
  if (transaction.currency === target) return transaction.amount;
  if (transaction.convertedCurrency === target) return transaction.convertedAmount;
  return convertAndRound(transaction.amount, transaction.currency, target, transaction.exchangeRate);
}

/** Signed value in `target`: income positive, expense negative. */
export function signedAmountIn(transaction: Transaction, target: Currency): number {
  const value = amountIn(transaction, target);
  return transaction.type === 'income' ? value : -value;
}

/**
 * `sign: 'auto'` shows a minus when negative, `'always'` also shows a plus, and
 * `'never'` formats the magnitude only (for rows that carry their own +/-).
 */
export function formatAmount(
  amount: number,
  currency: Currency,
  options: { sign?: 'auto' | 'always' | 'never' } = {}
): string {
  const { sign = 'auto' } = options;
  const decimals = DECIMALS[currency];
  const rounded = roundForCurrency(amount, currency);

  const formatted = Math.abs(rounded).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  let prefix = '';
  if (sign !== 'never') {
    if (rounded < 0) prefix = '-';
    else if (sign === 'always') prefix = '+';
  }

  return `${prefix}${CurrencySymbols[currency]}${formatted}`;
}

/** Parses free-typed input: strips separators and currency symbols. */
export function parseAmount(input: string): number | null {
  const cleaned = input.replace(/[^0-9.]/g, '');
  if (!cleaned) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}
