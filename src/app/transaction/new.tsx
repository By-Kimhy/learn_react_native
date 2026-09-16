import { useLocalSearchParams, useRouter } from 'expo-router';

import { TransactionForm } from '@/features/money/components/transaction-form';
import { useTransactions } from '@/features/money/store';
import { usePreferences } from '@/features/settings/store';
import type { TransactionType } from '@/types';

export default function NewTransactionScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const { addTransaction } = useTransactions();
  const { preferences } = usePreferences();

  // Defaults to an expense: it is by far the most frequently logged entry.
  const transactionType: TransactionType = type === 'income' ? 'income' : 'expense';

  return (
    <TransactionForm
      mode="create"
      type={transactionType}
      rate={preferences.exchangeRate}
      initialValues={{ currency: preferences.displayCurrency }}
      onSubmit={(draft) => {
        addTransaction(draft);
        router.back();
      }}
      onCancel={() => router.back()}
    />
  );
}
