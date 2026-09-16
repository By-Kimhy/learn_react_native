import { useLocalSearchParams, useRouter } from 'expo-router';

import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { TransactionForm } from '@/features/money/components/transaction-form';
import { useTransactions } from '@/features/money/store';
import { usePreferences, useT } from '@/features/settings/store';

export default function EditTransactionScreen() {
  const router = useRouter();
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { preferences } = usePreferences();

  const transaction = getTransaction(id);

  // Reachable if the record was deleted from another screen while this was open.
  if (!transaction) {
    return (
      <>
        <ScreenHeader title={t('common.error')} onBack={() => router.back()} />
        <Screen>
          <EmptyState
            icon="alert-circle-outline"
            title={t('transaction.noResults')}
            body={t('transaction.noResultsBody')}
          />
        </Screen>
      </>
    );
  }

  return (
    <TransactionForm
      mode="edit"
      type={transaction.type}
      // Editing keeps the rate the transaction was created with, so historical
      // amounts never silently change when the user edits the rate in Settings.
      rate={transaction.exchangeRate || preferences.exchangeRate}
      initialValues={{
        amount: String(transaction.amount),
        currency: transaction.currency,
        categoryId: transaction.categoryId,
        date: transaction.date,
        note: transaction.note ?? '',
      }}
      onSubmit={(draft) => {
        updateTransaction(transaction.id, draft);
        router.back();
      }}
      onCancel={() => router.back()}
      onDelete={() => {
        deleteTransaction(transaction.id);
        router.back();
      }}
    />
  );
}
