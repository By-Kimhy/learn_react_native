import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';

import { createId } from '@/lib/id';
import { StorageKeys } from '@/lib/storage';
import { usePersistedState } from '@/store/use-persisted-state';
import type { Transaction } from '@/types';

/** Newest first — the order every list in the app wants. */
function sortTransactions(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.createdAt < b.createdAt ? 1 : -1;
  });
}

function hydrateTransactions(raw: unknown): Transaction[] {
  if (!Array.isArray(raw)) return [];
  const valid = raw.filter(
    (item): item is Transaction =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as Transaction).id === 'string' &&
      typeof (item as Transaction).amount === 'number'
  );
  return sortTransactions(valid);
}

/** Module scope so the persisted-state load effect has a stable dependency. */
const NO_TRANSACTIONS: Transaction[] = [];

export type TransactionDraft = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;

interface TransactionsValue {
  transactions: Transaction[];
  ready: boolean;
  addTransaction: (draft: TransactionDraft) => Transaction;
  updateTransaction: (id: string, changes: Partial<TransactionDraft>) => void;
  deleteTransaction: (id: string) => void;
  getTransaction: (id: string) => Transaction | undefined;
}

const TransactionsContext = createContext<TransactionsValue | null>(null);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions, ready] = usePersistedState<Transaction[]>({
    key: StorageKeys.transactions,
    initial: NO_TRANSACTIONS,
    hydrate: hydrateTransactions,
  });

  const addTransaction = useCallback(
    (draft: TransactionDraft) => {
      const now = new Date().toISOString();
      const transaction: Transaction = { ...draft, id: createId('txn'), createdAt: now, updatedAt: now };
      setTransactions((current) => sortTransactions([transaction, ...current]));
      return transaction;
    },
    [setTransactions]
  );

  const updateTransaction = useCallback(
    (id: string, changes: Partial<TransactionDraft>) => {
      setTransactions((current) =>
        sortTransactions(
          current.map((transaction) =>
            transaction.id === id
              ? { ...transaction, ...changes, updatedAt: new Date().toISOString() }
              : transaction
          )
        )
      );
    },
    [setTransactions]
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      setTransactions((current) => current.filter((transaction) => transaction.id !== id));
    },
    [setTransactions]
  );

  const getTransaction = useCallback(
    (id: string) => transactions.find((transaction) => transaction.id === id),
    [transactions]
  );

  const value = useMemo(
    () => ({ transactions, ready, addTransaction, updateTransaction, deleteTransaction, getTransaction }),
    [transactions, ready, addTransaction, updateTransaction, deleteTransaction, getTransaction]
  );

  return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>;
}

export function useTransactions(): TransactionsValue {
  const value = useContext(TransactionsContext);
  if (!value) throw new Error('useTransactions must be used inside <TransactionsProvider>');
  return value;
}
