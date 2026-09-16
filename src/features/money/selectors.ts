import { fromISODate, monthKey, toISODate } from '@/lib/date';
import type { Currency, ISODate, Transaction } from '@/types';

import { amountIn } from './currency';

export interface Totals {
  income: number;
  expenses: number;
  balance: number;
}

export function totalsFor(transactions: Transaction[], currency: Currency): Totals {
  let income = 0;
  let expenses = 0;

  for (const transaction of transactions) {
    const value = amountIn(transaction, currency);
    if (transaction.type === 'income') income += value;
    else expenses += value;
  }

  return { income, expenses, balance: income - expenses };
}

export function inMonth(transactions: Transaction[], key: string): Transaction[] {
  return transactions.filter((transaction) => monthKey(transaction.date) === key);
}

export function inRange(transactions: Transaction[], from: ISODate, to: ISODate): Transaction[] {
  return transactions.filter((transaction) => transaction.date >= from && transaction.date <= to);
}

export interface DateGroup {
  date: ISODate;
  transactions: Transaction[];
}

/** Groups an already-sorted list into day buckets, preserving order. */
export function groupByDate(transactions: Transaction[]): DateGroup[] {
  const groups: DateGroup[] = [];
  let current: DateGroup | undefined;

  for (const transaction of transactions) {
    if (!current || current.date !== transaction.date) {
      current = { date: transaction.date, transactions: [] };
      groups.push(current);
    }
    current.transactions.push(transaction);
  }

  return groups;
}

export interface CategoryTotal {
  categoryId: string;
  total: number;
  share: number;
}

/** Category breakdown for one transaction type, largest first. */
export function totalsByCategory(
  transactions: Transaction[],
  currency: Currency,
  type: Transaction['type'] = 'expense'
): CategoryTotal[] {
  const sums = new Map<string, number>();
  let grandTotal = 0;

  for (const transaction of transactions) {
    if (transaction.type !== type) continue;
    const value = amountIn(transaction, currency);
    sums.set(transaction.categoryId, (sums.get(transaction.categoryId) ?? 0) + value);
    grandTotal += value;
  }

  return [...sums.entries()]
    .map(([categoryId, total]) => ({
      categoryId,
      total,
      share: grandTotal > 0 ? total / grandTotal : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export interface Bucket {
  key: string;
  label: string;
  income: number;
  expenses: number;
}

/** One bucket per day for the last `days` days, oldest first. */
export function dailyBuckets(
  transactions: Transaction[],
  currency: Currency,
  days: number,
  labelOf: (date: Date) => string
): Bucket[] {
  const buckets: Bucket[] = [];
  const index = new Map<string, Bucket>();
  const today = new Date();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
    const key = toISODate(date);
    const bucket: Bucket = { key, label: labelOf(date), income: 0, expenses: 0 };
    buckets.push(bucket);
    index.set(key, bucket);
  }

  for (const transaction of transactions) {
    const bucket = index.get(transaction.date);
    if (!bucket) continue;
    const value = amountIn(transaction, currency);
    if (transaction.type === 'income') bucket.income += value;
    else bucket.expenses += value;
  }

  return buckets;
}

/** One bucket per month ending at `endKey`, oldest first. */
export function monthlyBuckets(
  transactions: Transaction[],
  currency: Currency,
  months: number,
  endKey: string,
  labelOf: (key: string) => string
): Bucket[] {
  const [endYear, endMonth] = endKey.split('-').map(Number);
  const buckets: Bucket[] = [];
  const index = new Map<string, Bucket>();

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(endYear, endMonth - 1 - offset, 1);
    const key = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;
    const bucket: Bucket = { key, label: labelOf(key), income: 0, expenses: 0 };
    buckets.push(bucket);
    index.set(key, bucket);
  }

  for (const transaction of transactions) {
    const bucket = index.get(monthKey(transaction.date));
    if (!bucket) continue;
    const value = amountIn(transaction, currency);
    if (transaction.type === 'income') bucket.income += value;
    else bucket.expenses += value;
  }

  return buckets;
}

/** Weekly buckets (Mon-start) for the last `weeks` weeks, oldest first. */
export function weeklyBuckets(
  transactions: Transaction[],
  currency: Currency,
  weeks: number,
  labelOf: (start: Date) => string
): Bucket[] {
  const today = new Date();
  const weekday = (today.getDay() + 6) % 7;
  const thisWeekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - weekday);

  const buckets: Bucket[] = [];
  const starts: { start: Date; end: Date; bucket: Bucket }[] = [];

  for (let offset = weeks - 1; offset >= 0; offset -= 1) {
    const start = new Date(
      thisWeekStart.getFullYear(),
      thisWeekStart.getMonth(),
      thisWeekStart.getDate() - offset * 7
    );
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
    const bucket: Bucket = { key: toISODate(start), label: labelOf(start), income: 0, expenses: 0 };
    buckets.push(bucket);
    starts.push({ start, end, bucket });
  }

  for (const transaction of transactions) {
    const date = fromISODate(transaction.date);
    const match = starts.find(({ start, end }) => date >= start && date <= end);
    if (!match) continue;
    const value = amountIn(transaction, currency);
    if (transaction.type === 'income') match.bucket.income += value;
    else match.bucket.expenses += value;
  }

  return buckets;
}

/** Full-text search over note text and category id. */
export function searchTransactions(transactions: Transaction[], query: string): Transaction[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return transactions;

  return transactions.filter((transaction) => {
    const haystack = `${transaction.note ?? ''} ${transaction.categoryId} ${transaction.amount}`;
    return haystack.toLowerCase().includes(needle);
  });
}
