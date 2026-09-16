import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { AllCategories } from '@/features/money/categories';
import { TransactionList } from '@/features/money/components/transaction-list';
import { searchTransactions } from '@/features/money/selectors';
import { useTransactions } from '@/features/money/store';
import { useT } from '@/features/settings/store';
import type { TransactionType } from '@/types';

type TypeFilter = 'all' | TransactionType;

export default function TransactionsScreen() {
  const router = useRouter();
  const t = useT();
  const { transactions } = useTransactions();

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [categoryId, setCategoryId] = useState<string | null>(null);

  /** Only offer category chips the user actually has transactions for. */
  const usedCategories = useMemo(() => {
    const ids = new Set(
      transactions
        .filter((transaction) => typeFilter === 'all' || transaction.type === typeFilter)
        .map((transaction) => transaction.categoryId)
    );
    return AllCategories.filter((category) => ids.has(category.id));
  }, [transactions, typeFilter]);

  const results = useMemo(() => {
    let list = transactions;
    if (typeFilter !== 'all') list = list.filter((transaction) => transaction.type === typeFilter);
    if (categoryId) list = list.filter((transaction) => transaction.categoryId === categoryId);
    return searchTransactions(list, query);
  }, [transactions, typeFilter, categoryId, query]);

  const hasAny = transactions.length > 0;

  return (
    <>
      <ScreenHeader title={t('transaction.history')} onBack={() => router.back()} />

      <Screen contentContainerStyle={styles.content}>
        <View style={styles.filters}>
          <TextField
            value={query}
            onChangeText={setQuery}
            placeholder={t('transaction.searchPlaceholder')}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />

          <SegmentedControl
            accessibilityLabel={t('common.search')}
            options={[
              { value: 'all', label: t('transaction.filterAll') },
              { value: 'income', label: t('transaction.filterIncome') },
              { value: 'expense', label: t('transaction.filterExpense') },
            ]}
            value={typeFilter}
            onChange={(value) => {
              setTypeFilter(value);
              // A category from the other type would filter everything away.
              setCategoryId(null);
            }}
          />

          {usedCategories.length > 1 ? (
            <View style={styles.chips}>
              <Chip
                label={t('common.all')}
                selected={categoryId === null}
                onPress={() => setCategoryId(null)}
              />
              {usedCategories.map((category) => (
                <Chip
                  key={category.id}
                  label={t(category.labelKey)}
                  emoji={category.emoji}
                  selected={categoryId === category.id}
                  onPress={() => setCategoryId(categoryId === category.id ? null : category.id)}
                />
              ))}
            </View>
          ) : null}
        </View>

        {results.length > 0 ? (
          <TransactionList
            transactions={results}
            onSelect={(transaction) => router.push(`/transaction/${transaction.id}`)}
          />
        ) : hasAny ? (
          <EmptyState
            icon="search-outline"
            title={t('transaction.noResults')}
            body={t('transaction.noResultsBody')}
          />
        ) : (
          <EmptyState
            icon="receipt-outline"
            title={t('money.noTransactions')}
            body={t('money.noTransactionsBody')}
            action={{
              label: t('create.expense'),
              icon: 'add',
              onPress: () => router.push('/transaction/new?type=expense'),
            }}
          />
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: Spacing.lg },
  filters: { gap: Spacing.md, marginBottom: Spacing.xl },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
});
