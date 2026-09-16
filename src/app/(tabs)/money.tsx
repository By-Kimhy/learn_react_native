import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { BalanceCard } from '@/features/money/components/balance-card';
import { CategoryBreakdown } from '@/features/money/components/category-breakdown';
import { StatCard } from '@/features/money/components/stat-card';
import { TransactionList } from '@/features/money/components/transaction-list';
import { Currencies, CurrencySymbols } from '@/features/money/currency';
import { inMonth, totalsByCategory, totalsFor } from '@/features/money/selectors';
import { useTransactions } from '@/features/money/store';
import { useMoney } from '@/features/money/use-money';
import { usePreferences, useT } from '@/features/settings/store';
import { addMonths, currentMonthKey, formatMonth } from '@/lib/date';

const RECENT_LIMIT = 6;
const TOP_CATEGORIES = 5;

export default function MoneyScreen() {
  const router = useRouter();
  const t = useT();
  const insets = useSafeAreaInsets();
  const { preferences, updatePreferences } = usePreferences();
  const { transactions } = useTransactions();
  const { display, secondary, toSecondary } = useMoney();

  const [month, setMonth] = useState(currentMonthKey());
  const isCurrentMonth = month === currentMonthKey();

  const monthTransactions = useMemo(() => inMonth(transactions, month), [transactions, month]);

  const totals = useMemo(() => totalsFor(monthTransactions, display), [monthTransactions, display]);
  const allTime = useMemo(() => totalsFor(transactions, display), [transactions, display]);
  const byCategory = useMemo(
    () => totalsByCategory(monthTransactions, display, 'expense'),
    [monthTransactions, display]
  );

  const recent = monthTransactions.slice(0, RECENT_LIMIT);

  return (
    <Screen withTabBar contentContainerStyle={{ paddingTop: insets.top + Spacing.md }}>
      <View style={styles.header}>
        <Text variant="title" style={styles.headerTitle}>
          {t('money.title')}
        </Text>
        <IconButton
          name="stats-chart-outline"
          accessibilityLabel={t('money.statistics')}
          onPress={() => router.push('/statistics')}
          filled
        />
        <IconButton
          name="list-outline"
          accessibilityLabel={t('money.allTransactions')}
          onPress={() => router.push('/transactions')}
          filled
        />
      </View>

      <View style={styles.sections}>
        <View style={styles.monthBar}>
          <IconButton
            name="chevron-back"
            accessibilityLabel={t('common.previousMonth')}
            onPress={() => setMonth((current) => addMonths(current, -1))}
          />
          <Text variant="subheading" align="center" style={styles.monthLabel}>
            {formatMonth(month, preferences.language)}
          </Text>
          <IconButton
            name="chevron-forward"
            accessibilityLabel={t('common.nextMonth')}
            onPress={() => setMonth((current) => addMonths(current, 1))}
            disabled={isCurrentMonth}
          />
        </View>

        <BalanceCard totals={totals} caption={formatMonth(month, preferences.language)} />

        <SegmentedControl
          accessibilityLabel={t('money.displayCurrency')}
          options={Currencies.map((code) => ({
            value: code,
            label: `${CurrencySymbols[code]} ${code}`,
          }))}
          value={preferences.displayCurrency}
          onChange={(value) => updatePreferences({ displayCurrency: value })}
        />

        <View style={styles.stats}>
          <StatCard
            label={t('money.income')}
            value={totals.income}
            currency={display}
            secondaryValue={toSecondary(totals.income)}
            secondaryCurrency={secondary}
            tone="income"
            sign="always"
          />
          <StatCard
            label={t('money.expenses')}
            value={-totals.expenses}
            currency={display}
            secondaryValue={-toSecondary(totals.expenses)}
            secondaryCurrency={secondary}
            tone="expense"
          />
          <StatCard
            label={t('money.savings')}
            value={allTime.balance}
            currency={display}
            secondaryValue={toSecondary(allTime.balance)}
            secondaryCurrency={secondary}
          />
        </View>

        {byCategory.length > 0 ? (
          <View>
            <SectionHeader
              title={t('money.spendingByCategory')}
              action={{ label: t('common.seeAll'), onPress: () => router.push('/statistics') }}
            />
            <Card>
              <CategoryBreakdown totals={byCategory} currency={display} limit={TOP_CATEGORIES} />
            </Card>
          </View>
        ) : null}

        <View>
          <SectionHeader
            title={t('money.recentTransactions')}
            action={
              monthTransactions.length > 0
                ? { label: t('common.seeAll'), onPress: () => router.push('/transactions') }
                : undefined
            }
          />

          {recent.length > 0 ? (
            <TransactionList
              transactions={recent}
              onSelect={(transaction) => router.push(`/transaction/${transaction.id}`)}
            />
          ) : (
            <Card padded={false}>
              <EmptyState
                icon="receipt-outline"
                title={t('money.noTransactions')}
                body={t('money.noTransactionsBody')}
                action={{
                  label: t('create.expense'),
                  icon: 'add',
                  onPress: () => router.push('/transaction/new?type=expense'),
                }}
                compact
              />
            </Card>
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
  headerTitle: { flex: 1 },
  sections: { gap: Spacing.xl },
  monthBar: { flexDirection: 'row', alignItems: 'center' },
  monthLabel: { flex: 1 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
});
