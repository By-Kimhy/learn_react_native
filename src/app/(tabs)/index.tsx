import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppBar, AppBarBrand } from '@/components/ui/app-bar';
import { BrandMark } from '@/components/ui/brand-mark';
import { Card } from '@/components/ui/card';
import { Icon, type IconName } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { PageTitle } from '@/components/ui/page-title';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { EventRow } from '@/features/calendar/components/event-row';
import { upcomingOccurrences } from '@/features/calendar/selectors';
import { useEvents } from '@/features/calendar/store';
import { HomeHabits } from '@/features/habits/components/home-habits';
import { completionSet, currentStreak } from '@/features/habits/selectors';
import { useHabits } from '@/features/habits/store';
import { BalanceCard } from '@/features/money/components/balance-card';
import { TransactionRow } from '@/features/money/components/transaction-row';
import { inMonth, totalsFor } from '@/features/money/selectors';
import { useTransactions } from '@/features/money/store';
import { useMoney } from '@/features/money/use-money';
import { NoteCard } from '@/features/notes/components/note-card';
import { useNotes } from '@/features/notes/store';
import { usePreferences, useT } from '@/features/settings/store';
import { HomeTasks } from '@/features/tasks/components/home-tasks';
import { bucketTasks, todayProgress } from '@/features/tasks/selectors';
import { useTasks } from '@/features/tasks/store';
import { useAccents } from '@/hooks/use-theme';
import { currentMonthKey, formatFullDate, timeOfDay, todayISO } from '@/lib/date';
import type { TranslationKey } from '@/lib/i18n';

const RECENT_TRANSACTIONS = 3;
const RECENT_NOTES = 2;
const HOME_TASKS = 4;
const HOME_EVENTS = 3;

export default function HomeScreen() {
  const router = useRouter();
  const t = useT();
  const accents = useAccents();
  const { preferences } = usePreferences();
  const { transactions } = useTransactions();
  const { activeNotes } = useNotes();
  const { tasks, toggleTask } = useTasks();
  const { activeHabits, completions, toggleCompletion } = useHabits();
  const { events } = useEvents();
  const { display } = useMoney();

  const greetingKey: TranslationKey = `greeting.${timeOfDay()}`;

  const { allTime, thisMonth } = useMemo(() => {
    const monthly = inMonth(transactions, currentMonthKey());
    return {
      allTime: totalsFor(transactions, display),
      thisMonth: totalsFor(monthly, display),
    };
  }, [transactions, display]);

  const recentTransactions = transactions.slice(0, RECENT_TRANSACTIONS);
  const recentNotes = activeNotes.slice(0, RECENT_NOTES);

  const todayTasks = useMemo(() => bucketTasks(tasks).today.slice(0, HOME_TASKS), [tasks]);
  const taskProgress = useMemo(() => todayProgress(tasks), [tasks]);

  const habitsDoneToday = useMemo(() => {
    const today = todayISO();
    return new Set(completions.filter((c) => c.date === today).map((c) => c.habitId));
  }, [completions]);
  // One pass over completions instead of one per habit card.
  const habitStreaks = useMemo(() => {
    const map = new Map<string, number>();
    for (const habit of activeHabits) {
      map.set(habit.id, currentStreak(completionSet(completions, habit.id)));
    }
    return map;
  }, [activeHabits, completions]);

  const upcoming = useMemo(() => upcomingOccurrences(events, HOME_EVENTS), [events]);

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
            <>
              <IconButton
                name="notifications-outline"
                accessibilityLabel={t('reminders.title')}
                onPress={() => router.push('/reminders')}
              />
              <IconButton
                name="settings-outline"
                accessibilityLabel={t('settings.title')}
                onPress={() => router.push('/settings')}
                filled
              />
            </>
          }
        />
      }>
      <PageTitle
        title={`${t(greetingKey)} 👋`}
        subtitle={formatFullDate(new Date(), preferences.language)}
      />

      <View style={styles.sections}>
        <BalanceCard
          totals={{ ...allTime, income: thisMonth.income, expenses: thisMonth.expenses }}
          incomeLabel={t('home.incomeThisMonth')}
          expensesLabel={t('home.expensesThisMonth')}
        />

        <View style={styles.quickActions}>
          <QuickAction
            label={t('create.income')}
            icon="add"
            tint={accents.green.tint}
            background={accents.green.soft}
            onPress={() => router.push('/transaction/new?type=income')}
          />
          <QuickAction
            label={t('create.expense')}
            icon="remove"
            tint={accents.red.tint}
            background={accents.red.soft}
            onPress={() => router.push('/transaction/new?type=expense')}
          />
          <QuickAction
            label={t('create.note')}
            icon="create-outline"
            tint={accents.blue.tint}
            background={accents.blue.soft}
            onPress={() => router.push('/note/new?type=text')}
          />
        </View>

        <View>
          <SectionHeader
            title={t('tasks.today')}
            action={{ label: t('common.seeAll'), onPress: () => router.push('/tasks') }}
          />
          <HomeTasks
            tasks={todayTasks}
            progress={taskProgress}
            onToggle={(task) => toggleTask(task.id)}
            onSelect={(task) => router.push(`/task/${task.id}`)}
            onCreate={() => router.push('/task/new')}
          />
        </View>

        <View>
          <SectionHeader
            title={t('habits.title')}
            action={{ label: t('common.seeAll'), onPress: () => router.push('/habits') }}
          />
          <HomeHabits
            habits={activeHabits}
            doneToday={habitsDoneToday}
            streaks={habitStreaks}
            onToggle={(habit) => toggleCompletion(habit.id)}
            onCreate={() => router.push('/habit/new')}
          />
        </View>

        {upcoming.length > 0 ? (
          <View>
            <SectionHeader
              title={t('calendar.upcoming')}
              action={{ label: t('common.seeAll'), onPress: () => router.push('/calendar') }}
            />
            <Card style={styles.rowsCard}>
              {upcoming.map((occurrence, index) => (
                <View key={`${occurrence.event.id}-${occurrence.date}`}>
                  {index > 0 ? <RowDivider /> : null}
                  <EventRow
                    event={occurrence.event}
                    isRepeat={occurrence.isRepeat}
                    date={occurrence.date}
                    variant="chip"
                    onPress={() => router.push(`/event/${occurrence.event.id}`)}
                  />
                </View>
              ))}
            </Card>
          </View>
        ) : null}

        {recentTransactions.length > 0 ? (
          <View>
            <SectionHeader
              title={t('money.recentTransactions')}
              action={{ label: t('common.seeAll'), onPress: () => router.push('/transactions') }}
            />
            <Card style={styles.rowsCard}>
              {recentTransactions.map((transaction, index) => (
                <View key={transaction.id}>
                  {index > 0 ? <RowDivider /> : null}
                  <TransactionRow
                    transaction={transaction}
                    onPress={() => router.push(`/transaction/${transaction.id}`)}
                  />
                </View>
              ))}
            </Card>
          </View>
        ) : null}

        <View>
          <SectionHeader
            title={t('home.recentNotes')}
            action={{ label: t('common.seeAll'), onPress: () => router.push('/notes') }}
          />

          {recentNotes.length > 0 ? (
            <View style={styles.notesRow}>
              {recentNotes.map((note) => (
                <View key={note.id} style={styles.noteSlot}>
                  <NoteCard note={note} onPress={() => router.push(`/note/${note.id}`)} />
                </View>
              ))}
            </View>
          ) : (
            <Card>
              <PressableScale
                accessibilityRole="button"
                accessibilityLabel={t('notes.createNote')}
                onPress={() => router.push('/note/new?type=text')}
                style={styles.notesEmpty}>
                <Icon name="add-circle-outline" size={22} color="textTertiary" />
                <Text variant="body" color="textSecondary">
                  {t('home.noNotesYet')}
                </Text>
              </PressableScale>
            </Card>
          )}
        </View>
      </View>
    </Screen>
  );
}

function RowDivider() {
  const accents = useAccents();
  return <View style={[styles.rowDivider, { backgroundColor: accents.grey.soft }]} />;
}

function QuickAction({
  label,
  icon,
  tint,
  background,
  onPress,
}: {
  label: string;
  icon: IconName;
  tint: string;
  background: string;
  onPress: () => void;
}) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      scaleTo={0.95}
      style={[styles.quickAction, { backgroundColor: background }]}>
      <Icon name={icon} size={20} tint={tint} />
      <Text variant="captionStrong" tint={tint} numberOfLines={2} align="center">
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  sections: { gap: Spacing.xxl },
  quickActions: { flexDirection: 'row', gap: Spacing.sm },
  quickAction: {
    flex: 1,
    minHeight: 82,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  rowsCard: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.lg },
  rowDivider: { height: StyleSheet.hairlineWidth, marginLeft: 54 },
  notesRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  noteSlot: { flex: 1 },
  notesEmpty: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs },
});
