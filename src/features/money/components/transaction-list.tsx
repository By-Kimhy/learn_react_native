import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { usePreferences, useT } from '@/features/settings/store';
import { formatDateHeading } from '@/lib/date';
import type { Transaction } from '@/types';

import { groupByDate } from '../selectors';
import { TransactionRow } from './transaction-row';

export interface TransactionListProps {
  transactions: Transaction[];
  onSelect?: (transaction: Transaction) => void;
}

/**
 * Transactions grouped under day headings. Rendered as plain views so it can be
 * dropped inside an existing ScrollView without nesting virtualised lists.
 */
export function TransactionList({ transactions, onSelect }: TransactionListProps) {
  const t = useT();
  const { preferences } = usePreferences();
  const groups = groupByDate(transactions);

  return (
    <View style={styles.groups}>
      {groups.map((group) => (
        <View key={group.date} style={styles.group}>
          <Text variant="captionStrong" color="textSecondary">
            {formatDateHeading(group.date, preferences.language, {
              today: t('common.today'),
              yesterday: t('common.yesterday'),
            })}
          </Text>

          <Card style={styles.card}>
            {group.transactions.map((transaction, index) => (
              <Fragment key={transaction.id}>
                {index > 0 ? <Divider inset={54} /> : null}
                <TransactionRow
                  transaction={transaction}
                  onPress={onSelect ? () => onSelect(transaction) : undefined}
                />
              </Fragment>
            ))}
          </Card>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  groups: { gap: Spacing.xl },
  group: { gap: Spacing.sm },
  card: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.lg },
});
