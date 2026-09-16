import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { BarChart } from '@/features/money/components/bar-chart';
import { CategoryBreakdown } from '@/features/money/components/category-breakdown';
import { Legend } from '@/features/money/components/legend';
import { StatCard } from '@/features/money/components/stat-card';
import {
  dailyBuckets,
  monthlyBuckets,
  totalsByCategory,
  totalsFor,
  weeklyBuckets,
  type Bucket,
} from '@/features/money/selectors';
import { useTransactions } from '@/features/money/store';
import { useMoney } from '@/features/money/use-money';
import { usePreferences, useT } from '@/features/settings/store';
import { useTheme } from '@/hooks/use-theme';
import { currentMonthKey, formatMonthShort, formatWeekdayShort } from '@/lib/date';

type Range = 'daily' | 'weekly' | 'monthly';

const RANGE_SIZE: Record<Range, number> = { daily: 7, weekly: 6, monthly: 6 };

export default function StatisticsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const t = useT();
  const { preferences } = usePreferences();
  const { transactions } = useTransactions();
  const { display, secondary, toSecondary } = useMoney();

  const [range, setRange] = useState<Range>('daily');

  const buckets: Bucket[] = useMemo(() => {
    const { language } = preferences;

    if (range === 'daily') {
      return dailyBuckets(transactions, display, RANGE_SIZE.daily, (date) =>
        formatWeekdayShort(date, language).slice(0, 3)
      );
    }

    if (range === 'weekly') {
      return weeklyBuckets(transactions, display, RANGE_SIZE.weekly, (start) =>
        `${start.getDate()}/${start.getMonth() + 1}`
      );
    }

    return monthlyBuckets(transactions, display, RANGE_SIZE.monthly, currentMonthKey(), (key) =>
      formatMonthShort(key, language)
    );
  }, [transactions, display, range, preferences]);

  const rangeTotals = useMemo(() => {
    const income = buckets.reduce((sum, bucket) => sum + bucket.income, 0);
    const expenses = buckets.reduce((sum, bucket) => sum + bucket.expenses, 0);
    return { income, expenses, balance: income - expenses };
  }, [buckets]);

  /** The category split always reflects the same window as the chart above it. */
  const windowKeys = useMemo(() => new Set(buckets.map((bucket) => bucket.key)), [buckets]);
  const windowTransactions = useMemo(() => {
    if (range === 'daily') return transactions.filter((item) => windowKeys.has(item.date));
    if (range === 'monthly') return transactions.filter((item) => windowKeys.has(item.date.slice(0, 7)));

    const oldest = buckets[0]?.key;
    return oldest ? transactions.filter((item) => item.date >= oldest) : transactions;
  }, [transactions, range, windowKeys, buckets]);

  const byCategory = useMemo(
    () => totalsByCategory(windowTransactions, display, 'expense'),
    [windowTransactions, display]
  );

  const allTime = useMemo(() => totalsFor(transactions, display), [transactions, display]);

  const averagePerDay = useMemo(() => {
    const days = range === 'daily' ? RANGE_SIZE.daily : range === 'weekly' ? RANGE_SIZE.weekly * 7 : 180;
    return rangeTotals.expenses / days;
  }, [rangeTotals.expenses, range]);

  if (transactions.length === 0) {
    return (
      <>
        <ScreenHeader title={t('stats.title')} onBack={() => router.back()} />
        <Screen>
          <EmptyState
            icon="stats-chart-outline"
            title={t('stats.noData')}
            body={t('stats.noDataBody')}
            action={{
              label: t('create.expense'),
              icon: 'add',
              onPress: () => router.push('/transaction/new?type=expense'),
            }}
          />
        </Screen>
      </>
    );
  }

  return (
    <>
      <ScreenHeader title={t('stats.title')} onBack={() => router.back()} />

      <Screen contentContainerStyle={styles.content}>
        <View style={styles.sections}>
          <SegmentedControl
            accessibilityLabel={t('stats.title')}
            options={[
              { value: 'daily', label: t('stats.daily') },
              { value: 'weekly', label: t('stats.weekly') },
              { value: 'monthly', label: t('stats.monthly') },
            ]}
            value={range}
            onChange={setRange}
          />

          <Card style={styles.chartCard}>
            <Text variant="subheading">{t('stats.incomeVsExpenses')}</Text>
            <BarChart buckets={buckets} currency={display} series="both" />
            <Legend
              items={[
                { label: t('money.income'), color: theme.income },
                { label: t('money.expenses'), color: theme.expense },
              ]}
            />
          </Card>

          <View style={styles.stats}>
            <StatCard
              label={t('money.income')}
              value={rangeTotals.income}
              currency={display}
              secondaryValue={toSecondary(rangeTotals.income)}
              secondaryCurrency={secondary}
              tone="income"
              sign="always"
            />
            <StatCard
              label={t('money.expenses')}
              value={-rangeTotals.expenses}
              currency={display}
              secondaryValue={-toSecondary(rangeTotals.expenses)}
              secondaryCurrency={secondary}
              tone="expense"
            />
            <StatCard
              label={t('stats.avgPerDay')}
              value={averagePerDay}
              currency={display}
              secondaryValue={toSecondary(averagePerDay)}
              secondaryCurrency={secondary}
            />
            <StatCard
              label={t('stats.savings')}
              value={allTime.balance}
              currency={display}
              secondaryValue={toSecondary(allTime.balance)}
              secondaryCurrency={secondary}
            />
          </View>

          <Card style={styles.chartCard}>
            <Text variant="subheading">{t('stats.spendingByCategory')}</Text>
            {byCategory.length > 0 ? (
              <CategoryBreakdown totals={byCategory} currency={display} />
            ) : (
              <Text variant="body" color="textSecondary">
                {t('money.noExpensesBody')}
              </Text>
            )}
          </Card>
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: Spacing.lg },
  sections: { gap: Spacing.lg },
  chartCard: { gap: Spacing.lg },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
});
