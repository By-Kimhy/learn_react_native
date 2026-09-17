import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppBar, AppBarBrand } from '@/components/ui/app-bar';
import { BrandMark } from '@/components/ui/brand-mark';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { IconButton } from '@/components/ui/icon-button';
import { PageTitle } from '@/components/ui/page-title';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
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
    <Screen
      withTabBar
      header={
        <AppBar
          title="LifeHub"
          leading={
            <AppBarBrand>
              <BrandMark size={22} />
            </AppBarBrand>
          }
          actions={
            <IconButton
              name="settings-outline"
              accessibilityLabel={t('settings.title')}
              onPress={() => router.push('/settings')}
              filled
            />
          }
        />
      }>
      <PageTitle
        title={t('money.title')}
        actions={
          <>
            <IconButton
              name="stats-chart-outline"
              accessibilityLabel={t('money.statistics')}
              onPress={() => router.push('/statistics')}
              filled
            />
            <IconButton
              name="receipt-outline"
              accessibilityLabel={t('money.allTransactions')}
              onPress={() => router.push('/transactions')}
              filled
            />
          </>
        }
      />

      <View style={styles.sections}>
        <Card style={styles.monthBar} padded={false}>
          <IconButton
            name="chevron-back"
            accessibilityLabel={t('common.previousMonth')}
            onPress={() => setMonth((current) => addMonths(current, -1))}
          />
          <Text variant="subheading" align="center" style={styles.monthLabel} numberOfLines={1}>
            {formatMonth(month, preferences.language)}
          </Text>
          <IconButton
            name="chevron-forward"
            accessibilityLabel={t('common.nextMonth')}
            onPress={() => setMonth((current) => addMonths(current, 1))}
            disabled={isCurrentMonth}
          />
        </Card>

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
          {/* The month's two flows pair up; the running balance they add to
              gets its own full-width row rather than a cramped third column. */}
          <View style={styles.statsRow}>
            <StatCard
              label={t('money.income')}
              value={totals.income}
              currency={display}
              secondaryValue={toSecondary(totals.income)}
              secondaryCurrency={secondary}
              tone="income"
              sign="always"
              icon="arrow-down-circle"
            />
            <StatCard
              label={t('money.expenses')}
              value={-totals.expenses}
              currency={display}
              secondaryValue={-toSecondary(totals.expenses)}
              secondaryCurrency={secondary}
              tone="expense"
              icon="arrow-up-circle"
            />
          </View>

          {/* Wrapped in a row of its own so StatTile's `flex: 1` still means
              "fill the width" rather than "stretch down the column". */}
          <View style={styles.statsRow}>
            <StatCard
              label={t('money.savings')}
              value={allTime.balance}
              currency={display}
              secondaryValue={toSecondary(allTime.balance)}
              secondaryCurrency={secondary}
              icon="wallet-outline"
            />
          </View>
        </View>

        {byCategory.length > 0 ? (
          <Card>
            <SectionHeader
              title={t('money.spendingByCategory')}
              accent
              inCard
              action={{ label: t('common.seeAll'), onPress: () => router.push('/statistics') }}
            />
            <CategoryBreakdown totals={byCategory} currency={display} limit={TOP_CATEGORIES} />
          </Card>
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
  sections: { gap: Spacing.lg },
  monthBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xs },
  monthLabel: { flex: 1 },
  stats: { gap: Spacing.sm },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
});
